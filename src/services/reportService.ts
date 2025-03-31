import { prisma } from '../lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: number;
  bookId?: number;
  status?: string;
}

export interface ReportData {
  totalLoans: number;
  totalOverdue: number;
  totalFines: number;
  totalPaidFines: number;
  totalPendingFines: number;
  mostBorrowedBooks: Array<{
    id: number;
    title: string;
    author: string;
    totalLoans: number;
  }>;
  userStats: Array<{
    id: number;
    name: string;
    totalLoans: number;
    totalOverdue: number;
    totalFines: number;
  }>;
  monthlyStats: Array<{
    month: string;
    totalLoans: number;
    totalReturns: number;
    totalFines: number;
  }>;
}

export class ReportService {
  private static instance: ReportService;

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  /**
   * Gera relatório completo do sistema
   */
  async generateFullReport(filters: ReportFilters = {}): Promise<ReportData> {
    const { startDate, endDate, userId, bookId, status } = filters;

    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    // Busca empréstimos
    const loans = await prisma.loans.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter }),
        ...(userId && { user_id: userId }),
        ...(bookId && { book_id: bookId }),
        ...(status && { status }),
      },
      include: {
        user: true,
        book: true,
        fines: true,
      },
    });

    // Estatísticas gerais
    const totalLoans = loans.length;
    const totalOverdue = loans.filter(loan => loan.status === 'overdue').length;
    
    // Estatísticas de multas
    const fines = loans.flatMap(loan => loan.fines);
    const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
    const totalPaidFines = fines
      .filter(fine => fine.status === 'paid')
      .reduce((sum, fine) => sum + fine.amount, 0);
    const totalPendingFines = totalFines - totalPaidFines;

    // Livros mais emprestados
    const bookStats = new Map<number, { book: any; count: number }>();
    loans.forEach(loan => {
      const current = bookStats.get(loan.book_id) || { book: loan.book, count: 0 };
      bookStats.set(loan.book_id, { book: loan.book, count: current.count + 1 });
    });

    const mostBorrowedBooks = Array.from(bookStats.entries())
      .map(([_, { book, count }]) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        totalLoans: count,
      }))
      .sort((a, b) => b.totalLoans - a.totalLoans)
      .slice(0, 10);

    // Estatísticas por usuário
    const userStats = new Map<number, {
      user: any;
      loans: number;
      overdue: number;
      fines: number;
    }>();

    loans.forEach(loan => {
      const current = userStats.get(loan.user_id) || {
        user: loan.user,
        loans: 0,
        overdue: 0,
        fines: 0,
      };

      userStats.set(loan.user_id, {
        user: loan.user,
        loans: current.loans + 1,
        overdue: current.overdue + (loan.status === 'overdue' ? 1 : 0),
        fines: current.fines + loan.fines.reduce((sum, fine) => sum + fine.amount, 0),
      });
    });

    const userStatsArray = Array.from(userStats.entries())
      .map(([_, stats]) => ({
        id: stats.user.id,
        name: stats.user.name,
        totalLoans: stats.loans,
        totalOverdue: stats.overdue,
        totalFines: stats.fines,
      }))
      .sort((a, b) => b.totalLoans - a.totalLoans);

    // Estatísticas mensais
    const monthlyStats = new Map<string, {
      loans: number;
      returns: number;
      fines: number;
    }>();

    loans.forEach(loan => {
      const month = format(loan.created_at, 'MMMM yyyy', { locale: ptBR });
      const current = monthlyStats.get(month) || {
        loans: 0,
        returns: 0,
        fines: 0,
      };

      monthlyStats.set(month, {
        loans: current.loans + 1,
        returns: current.returns + (loan.status === 'returned' ? 1 : 0),
        fines: current.fines + loan.fines.reduce((sum, fine) => sum + fine.amount, 0),
      });
    });

    const monthlyStatsArray = Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({
        month,
        totalLoans: stats.loans,
        totalReturns: stats.returns,
        totalFines: stats.fines,
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split(' ').reverse();
        const [monthB, yearB] = b.month.split(' ').reverse();
        return new Date(`${monthA} ${yearA}`).getTime() - new Date(`${monthB} ${yearB}`).getTime();
      });

    return {
      totalLoans,
      totalOverdue,
      totalFines,
      totalPaidFines,
      totalPendingFines,
      mostBorrowedBooks,
      userStats: userStatsArray,
      monthlyStats: monthlyStatsArray,
    };
  }

  /**
   * Gera relatório de multas
   */
  async generateFinesReport(filters: ReportFilters = {}): Promise<{
    fines: any[];
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }> {
    const { startDate, endDate, userId } = filters;

    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    const fines = await prisma.fines.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter }),
        ...(userId && { loan: { user_id: userId } }),
      },
      include: {
        loan: {
          include: {
            user: true,
            book: true,
          },
        },
      },
    });

    const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);
    const paidAmount = fines
      .filter(fine => fine.status === 'paid')
      .reduce((sum, fine) => sum + fine.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    return {
      fines,
      totalAmount,
      paidAmount,
      pendingAmount,
    };
  }

  /**
   * Gera relatório de empréstimos
   */
  async generateLoansReport(filters: ReportFilters = {}): Promise<{
    loans: any[];
    totalLoans: number;
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
  }> {
    const { startDate, endDate, userId, bookId, status } = filters;

    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    const loans = await prisma.loans.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter }),
        ...(userId && { user_id: userId }),
        ...(bookId && { book_id: bookId }),
        ...(status && { status }),
      },
      include: {
        user: true,
        book: true,
        fines: true,
      },
    });

    return {
      loans,
      totalLoans: loans.length,
      activeLoans: loans.filter(loan => loan.status === 'active').length,
      returnedLoans: loans.filter(loan => loan.status === 'returned').length,
      overdueLoans: loans.filter(loan => loan.status === 'overdue').length,
    };
  }
} 