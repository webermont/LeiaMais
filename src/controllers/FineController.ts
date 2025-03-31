import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { calculateFineAmount } from '../utils/fineCalculator';

export class FineController {
  constructor() {
    this.calculateFine = this.calculateFine.bind(this);
    this.createFine = this.createFine.bind(this);
    this.updateFineStatus = this.updateFineStatus.bind(this);
    this.getUserFines = this.getUserFines.bind(this);
    this.getPendingFines = this.getPendingFines.bind(this);
    this.processAutomaticFines = this.processAutomaticFines.bind(this);
  }

  // Calcula a multa para um empréstimo
  async calculateFine(req: Request, res: Response) {
    try {
      const { loanId } = req.params;
      
      const loan = await prisma.loans.findUnique({
        where: { id: Number(loanId) }
      });

      if (!loan) {
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      }

      if (loan.status !== 'active' && loan.status !== 'overdue') {
        return res.status(400).json({ error: 'Empréstimo não está ativo ou atrasado' });
      }

      const dueDate = new Date(loan.due_date);
      const today = new Date();
      
      if (dueDate >= today) {
        return res.status(400).json({ error: 'Empréstimo não está atrasado' });
      }

      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const amount = await calculateFineAmount(daysOverdue);

      return res.json({
        daysOverdue,
        amount,
        dueDate: loan.due_date
      });
    } catch (error) {
      console.error('Erro ao calcular multa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Cria uma nova multa
  async createFine(req: Request, res: Response) {
    try {
      const { loanId } = req.body;

      const loan = await prisma.loans.findUnique({
        where: { id: Number(loanId) }
      });

      if (!loan) {
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      }

      const calculation = await this.calculateFineAmount(loan);
      
      const fine = await prisma.fines.create({
        data: {
          loan_id: Number(loanId),
          amount: calculation.amount,
          status: 'pending',
          due_date: loan.due_date
        }
      });

      // Atualiza o status do empréstimo
      await prisma.loans.update({
        where: { id: Number(loanId) },
        data: { status: 'overdue' }
      });

      return res.status(201).json(fine);
    } catch (error) {
      console.error('Erro ao criar multa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualiza o status de uma multa
  async updateFineStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const fine = await prisma.fines.update({
        where: { id: Number(id) },
        data: { status }
      });

      // Se a multa foi paga, atualiza o empréstimo
      if (status === 'paid') {
        await prisma.loans.update({
          where: { id: fine.loan_id },
          data: { fine_paid: true }
        });
      }

      return res.json(fine);
    } catch (error) {
      console.error('Erro ao atualizar multa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obtém todas as multas de um usuário
  async getUserFines(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const fines = await prisma.fines.findMany({
        where: {
          loan: {
            user_id: Number(userId)
          }
        },
        include: {
          loan: true
        }
      });

      return res.json(fines);
    } catch (error) {
      console.error('Erro ao buscar multas do usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obtém todas as multas pendentes
  async getPendingFines(req: Request, res: Response) {
    try {
      const fines = await prisma.fines.findMany({
        where: {
          status: 'pending'
        },
        include: {
          loan: true
        }
      });

      return res.json(fines);
    } catch (error) {
      console.error('Erro ao buscar multas pendentes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Processa multas automaticamente
  async processAutomaticFines(req: Request, res: Response) {
    try {
      // Busca empréstimos atrasados sem multa
      const overdueLoans = await prisma.loans.findMany({
        where: {
          due_date: {
            lt: new Date()
          },
          status: 'active',
          fine_paid: false
        }
      });

      const processedFines = await Promise.all(
        overdueLoans.map(async (loan) => {
          const calculation = await this.calculateFineAmount(loan);
          
          const fine = await prisma.fines.create({
            data: {
              loan_id: loan.id,
              amount: calculation.amount,
              status: 'pending',
              due_date: loan.due_date
            }
          });

          await prisma.loans.update({
            where: { id: loan.id },
            data: { status: 'overdue' }
          });

          return fine;
        })
      );

      return res.json({
        processed: processedFines.length,
        fines: processedFines
      });
    } catch (error) {
      console.error('Erro ao processar multas automáticas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Método auxiliar para calcular o valor da multa
  private async calculateFineAmount(loan: any) {
    const dueDate = new Date(loan.due_date);
    const today = new Date();
    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const amount = await calculateFineAmount(daysOverdue);

    return {
      daysOverdue,
      amount,
      dueDate: loan.due_date
    };
  }
} 