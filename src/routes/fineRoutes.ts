import { Router } from 'express';
import { FineController } from '../controllers/FineController';

const router = Router();
const fineController = new FineController();

// Rota para calcular multa
router.get('/calculate/:loanId', fineController.calculateFine);

// Rota para criar multa
router.post('/', fineController.createFine);

// Rota para atualizar status da multa
router.patch('/:id', fineController.updateFineStatus);

// Rota para buscar multas de um usuário
router.get('/user/:userId', fineController.getUserFines);

// Rota para buscar multas pendentes
router.get('/pending', fineController.getPendingFines);

// Rota para processar multas automaticamente
router.post('/process-automatic', fineController.processAutomaticFines);

export default router; 