import { emailTransporter, emailTemplates } from '../config/email';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Envia email de notificação de multa
   */
  async sendFineNotification(userId: number, fineId: number): Promise<void> {
    try {
      const fine = await prisma.fines.findUnique({
        where: { id: fineId },
        include: {
          loan: {
            include: {
              user: true,
              book: true,
            },
          },
        },
      });

      if (!fine) {
        throw new Error('Multa não encontrada');
      }

      const { user, book } = fine.loan;
      
      await emailTransporter.sendMail({
        to: user.email,
        subject: emailTemplates.fineNotification.subject,
        text: emailTemplates.fineNotification.text(
          user.name,
          book.title,
          fine.amount
        ),
      });

      // Registra o envio do email
      await prisma.notifications.create({
        data: {
          user_id: userId,
          type: 'FINE',
          content: `Email de multa enviado para ${user.email}`,
          reference_id: fineId.toString(),
        },
      });

      logger.info(`Email de multa enviado para ${user.email}`);
    } catch (error) {
      logger.error('Erro ao enviar email de multa:', error);
      throw error;
    }
  }

  /**
   * Envia email de empréstimo em atraso
   */
  async sendLoanOverdueNotification(loanId: number): Promise<void> {
    try {
      const loan = await prisma.loans.findUnique({
        where: { id: loanId },
        include: {
          user: true,
          book: true,
        },
      });

      if (!loan) {
        throw new Error('Empréstimo não encontrado');
      }

      await emailTransporter.sendMail({
        to: loan.user.email,
        subject: emailTemplates.loanOverdue.subject,
        text: emailTemplates.loanOverdue.text(
          loan.user.name,
          loan.book.title,
          loan.due_date.toLocaleDateString('pt-BR')
        ),
      });

      // Registra o envio do email
      await prisma.notifications.create({
        data: {
          user_id: loan.user_id,
          type: 'OVERDUE',
          content: `Email de atraso enviado para ${loan.user.email}`,
          reference_id: loanId.toString(),
        },
      });

      logger.info(`Email de atraso enviado para ${loan.user.email}`);
    } catch (error) {
      logger.error('Erro ao enviar email de atraso:', error);
      throw error;
    }
  }

  /**
   * Envia email de reserva disponível
   */
  async sendReservationAvailableNotification(reservationId: number): Promise<void> {
    try {
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: {
          user: true,
          book: true,
        },
      });

      if (!reservation) {
        throw new Error('Reserva não encontrada');
      }

      await emailTransporter.sendMail({
        to: reservation.user.email,
        subject: emailTemplates.reservationAvailable.subject,
        text: emailTemplates.reservationAvailable.text(
          reservation.user.name,
          reservation.book.title
        ),
      });

      // Registra o envio do email
      await prisma.notifications.create({
        data: {
          user_id: reservation.user_id,
          type: 'RESERVATION',
          content: `Email de reserva disponível enviado para ${reservation.user.email}`,
          reference_id: reservationId.toString(),
        },
      });

      logger.info(`Email de reserva disponível enviado para ${reservation.user.email}`);
    } catch (error) {
      logger.error('Erro ao enviar email de reserva:', error);
      throw error;
    }
  }
} 