import { Request, Response } from 'express';
import { FineController } from '../../controllers/FineController';
import { prisma } from '../../lib/prisma';
import { calculateFineAmount } from '../../utils/fineCalculator';

// Mock do prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    loans: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    fines: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    settings: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock do calculateFineAmount
jest.mock('../../utils/fineCalculator', () => ({
  calculateFineAmount: jest.fn(),
}));

describe('FineController', () => {
  let controller: FineController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    controller = new FineController();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };
    mockReq = {};
    jest.clearAllMocks();
  });

  describe('calculateFine', () => {
    it('deve calcular multa para empréstimo atrasado', async () => {
      const mockLoan = {
        id: 1,
        status: 'overdue',
        due_date: new Date('2024-03-01'),
      };

      (prisma.loans.findUnique as jest.Mock).mockResolvedValue(mockLoan);
      (calculateFineAmount as jest.Mock).mockResolvedValue(10.00);

      mockReq.params = { loanId: '1' };

      await controller.calculateFine(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        daysOverdue: expect.any(Number),
        amount: 10.00,
        dueDate: mockLoan.due_date,
      });
    });

    it('deve retornar erro 404 para empréstimo não encontrado', async () => {
      (prisma.loans.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq.params = { loanId: '999' };

      await controller.calculateFine(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Empréstimo não encontrado' });
    });
  });

  describe('createFine', () => {
    it('deve criar uma nova multa', async () => {
      const mockLoan = {
        id: 1,
        status: 'overdue',
        due_date: new Date('2024-03-01'),
      };

      const mockFine = {
        id: 1,
        loan_id: 1,
        amount: 10.00,
        status: 'pending',
        due_date: mockLoan.due_date,
      };

      (prisma.loans.findUnique as jest.Mock).mockResolvedValue(mockLoan);
      (prisma.fines.create as jest.Mock).mockResolvedValue(mockFine);
      (calculateFineAmount as jest.Mock).mockResolvedValue(10.00);

      mockReq.body = { loanId: 1 };

      await controller.createFine(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockFine);
    });
  });

  describe('updateFineStatus', () => {
    it('deve atualizar status da multa para pago', async () => {
      const mockFine = {
        id: 1,
        loan_id: 1,
        status: 'paid',
      };

      (prisma.fines.update as jest.Mock).mockResolvedValue(mockFine);

      mockReq.params = { id: '1' };
      mockReq.body = { status: 'paid' };

      await controller.updateFineStatus(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(mockFine);
      expect(prisma.loans.update).toHaveBeenCalledWith({
        where: { id: mockFine.loan_id },
        data: { fine_paid: true },
      });
    });
  });

  describe('getUserFines', () => {
    it('deve retornar multas do usuário', async () => {
      const mockFines = [
        {
          id: 1,
          loan_id: 1,
          amount: 10.00,
          status: 'pending',
        },
      ];

      (prisma.fines.findMany as jest.Mock).mockResolvedValue(mockFines);

      mockReq.params = { userId: '1' };

      await controller.getUserFines(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(mockFines);
    });
  });

  describe('getPendingFines', () => {
    it('deve retornar multas pendentes', async () => {
      const mockFines = [
        {
          id: 1,
          loan_id: 1,
          amount: 10.00,
          status: 'pending',
        },
      ];

      (prisma.fines.findMany as jest.Mock).mockResolvedValue(mockFines);

      await controller.getPendingFines(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(mockFines);
    });
  });

  describe('processAutomaticFines', () => {
    it('deve processar multas automáticas', async () => {
      const mockLoans = [
        {
          id: 1,
          status: 'active',
          due_date: new Date('2024-03-01'),
        },
      ];

      const mockFine = {
        id: 1,
        loan_id: 1,
        amount: 10.00,
        status: 'pending',
      };

      (prisma.loans.findMany as jest.Mock).mockResolvedValue(mockLoans);
      (prisma.fines.create as jest.Mock).mockResolvedValue(mockFine);
      (calculateFineAmount as jest.Mock).mockResolvedValue(10.00);

      await controller.processAutomaticFines(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith({
        processed: 1,
        fines: [mockFine],
      });
    });
  });
}); 