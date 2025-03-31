import { api } from '../lib/api';

export interface Fine {
  id: number;
  loanId: number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FineCalculation {
  daysOverdue: number;
  amount: number;
  dueDate: string;
}

export const fineService = {
  // Calcula a multa para um empréstimo atrasado
  calculateFine: async (loanId: number): Promise<FineCalculation> => {
    const response = await api.get(`/fines/calculate/${loanId}`);
    return response.data;
  },

  // Cria uma nova multa
  createFine: async (loanId: number): Promise<Fine> => {
    const response = await api.post('/fines', { loanId });
    return response.data;
  },

  // Atualiza o status de uma multa
  updateFineStatus: async (fineId: number, status: Fine['status']): Promise<Fine> => {
    const response = await api.patch(`/fines/${fineId}`, { status });
    return response.data;
  },

  // Obtém todas as multas de um usuário
  getUserFines: async (userId: number): Promise<Fine[]> => {
    const response = await api.get(`/fines/user/${userId}`);
    return response.data;
  },

  // Obtém todas as multas pendentes
  getPendingFines: async (): Promise<Fine[]> => {
    const response = await api.get('/fines/pending');
    return response.data;
  },

  // Processa multas automaticamente
  processAutomaticFines: async (): Promise<void> => {
    await api.post('/fines/process-automatic');
  }
}; 