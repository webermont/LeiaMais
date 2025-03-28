import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'disponível' | 'emprestado' | 'atrasado' | 'reservado' | 'bloqueado';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'disponível':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'emprestado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'atrasado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reservado':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'bloqueado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default StatusBadge;
