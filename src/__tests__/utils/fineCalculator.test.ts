import { calculateFineAmount } from '../../utils/fineCalculator';
import { prisma } from '../../lib/prisma';

// Mock do prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    settings: {
      findUnique: jest.fn(),
    },
  },
}));

describe('fineCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve calcular multa usando valor padrão quando não há configuração', async () => {
    (prisma.settings.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await calculateFineAmount(5);

    expect(result).toBe(5.00); // 5 dias * R$ 1,00
  });

  it('deve calcular multa usando valor das configurações', async () => {
    (prisma.settings.findUnique as jest.Mock).mockResolvedValue({
      key: 'fine_per_day',
      value: '2.50',
    });

    const result = await calculateFineAmount(3);

    expect(result).toBe(7.50); // 3 dias * R$ 2,50
  });

  it('deve arredondar resultado para duas casas decimais', async () => {
    (prisma.settings.findUnique as jest.Mock).mockResolvedValue({
      key: 'fine_per_day',
      value: '1.33',
    });

    const result = await calculateFineAmount(3);

    expect(result).toBe(3.99); // 3 dias * R$ 1,33 = 3,99
  });

  it('deve usar valor padrão em caso de erro', async () => {
    (prisma.settings.findUnique as jest.Mock).mockRejectedValue(new Error('Erro de banco'));

    const result = await calculateFineAmount(2);

    expect(result).toBe(2.00); // 2 dias * R$ 1,00
  });
}); 