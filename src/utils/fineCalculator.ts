import { prisma } from '../lib/prisma';

const DEFAULT_FINE_PER_DAY = 1.00; // Valor padrão da multa por dia

export const calculateFineAmount = async (daysOverdue: number): Promise<number> => {
  try {
    // Busca o valor da multa por dia nas configurações
    const finePerDaySetting = await prisma.settings.findUnique({
      where: { key: 'fine_per_day' }
    });

    // Usa o valor das configurações ou o valor padrão
    const finePerDay = finePerDaySetting 
      ? parseFloat(finePerDaySetting.value)
      : DEFAULT_FINE_PER_DAY;

    // Calcula o valor total da multa
    const totalFine = finePerDay * daysOverdue;

    // Retorna o valor com duas casas decimais
    return Number(totalFine.toFixed(2));
  } catch (error) {
    console.error('Erro ao calcular valor da multa:', error);
    // Em caso de erro, retorna o cálculo com o valor padrão
    return Number((DEFAULT_FINE_PER_DAY * daysOverdue).toFixed(2));
  }
}; 