import { create } from 'zustand';
import { fineService, Fine } from '../services/fineService';

interface FineStore {
  fines: Fine[];
  loading: boolean;
  error: string | null;
  fetchUserFines: (userId: number) => Promise<void>;
  fetchPendingFines: () => Promise<void>;
  updateFineStatus: (fineId: number, status: Fine['status']) => Promise<void>;
  processAutomaticFines: () => Promise<void>;
}

export const useFineStore = create<FineStore>((set, get) => ({
  fines: [],
  loading: false,
  error: null,

  fetchUserFines: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const fines = await fineService.getUserFines(userId);
      set({ fines, loading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar multas', loading: false });
    }
  },

  fetchPendingFines: async () => {
    try {
      set({ loading: true, error: null });
      const fines = await fineService.getPendingFines();
      set({ fines, loading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar multas pendentes', loading: false });
    }
  },

  updateFineStatus: async (fineId: number, status: Fine['status']) => {
    try {
      set({ loading: true, error: null });
      const updatedFine = await fineService.updateFineStatus(fineId, status);
      set((state) => ({
        fines: state.fines.map((fine) =>
          fine.id === fineId ? updatedFine : fine
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Erro ao atualizar status da multa', loading: false });
    }
  },

  processAutomaticFines: async () => {
    try {
      set({ loading: true, error: null });
      await fineService.processAutomaticFines();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Erro ao processar multas automaticamente', loading: false });
    }
  },
})); 