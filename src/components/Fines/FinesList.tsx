import React from 'react';
import { useFineStore } from '../../store/fineStore';
import { Fine } from '../../services/fineService';
import { formatCurrency } from '../../utils/format';

export const FinesList: React.FC = () => {
  const { fines, loading, error, fetchPendingFines } = useFineStore();

  React.useEffect(() => {
    fetchPendingFines();
  }, [fetchPendingFines]);

  if (loading) {
    return <div>Carregando multas...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (fines.length === 0) {
    return <div>Nenhuma multa pendente encontrada.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Multas Pendentes</h2>
      <div className="grid gap-4">
        {fines.map((fine) => (
          <FineCard key={fine.id} fine={fine} />
        ))}
      </div>
    </div>
  );
};

interface FineCardProps {
  fine: Fine;
}

const FineCard: React.FC<FineCardProps> = ({ fine }) => {
  const { updateFineStatus } = useFineStore();

  const handleStatusUpdate = async (status: Fine['status']) => {
    await updateFineStatus(fine.id, status);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">Multa #{fine.id}</h3>
          <p className="text-sm text-gray-600">
            Empréstimo #{fine.loanId}
          </p>
          <p className="text-sm text-gray-600">
            Vencimento: {new Date(fine.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(fine.amount)}
          </p>
          <span className={`px-2 py-1 text-xs rounded-full ${
            fine.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            fine.status === 'paid' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {fine.status === 'pending' ? 'Pendente' :
             fine.status === 'paid' ? 'Paga' :
             'Cancelada'}
          </span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {fine.status === 'pending' && (
          <>
            <button
              onClick={() => handleStatusUpdate('paid')}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Marcar como Paga
            </button>
            <button
              onClick={() => handleStatusUpdate('cancelled')}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}; 