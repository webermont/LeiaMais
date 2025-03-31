import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from '@/lib/axios'; // Assumindo que a instância axios está em lib/axios
import { Loan, LoanStatus } from '@/types'; // Importando tipos definidos anteriormente
import { useAuthStore } from '@/store'; // Para pegar informações do usuário logado
import { format } from 'date-fns'; // Para formatar datas
import { ptBR } from 'date-fns/locale'; // Para formato brasileiro
import { toast } from 'sonner'; // Para notificações

// Função auxiliar para obter o texto do status
const getStatusText = (status: LoanStatus): string => {
  switch (status) {
    case LoanStatus.ACTIVE: return 'Ativo';
    case LoanStatus.RETURNED: return 'Devolvido';
    case LoanStatus.OVERDUE: return 'Atrasado';
    default: return 'Desconhecido';
  }
};

// Função auxiliar para obter a cor do badge do status
const getStatusBadgeVariant = (status: LoanStatus): "default" | "destructive" | "secondary" | "outline" | null | undefined => {
    switch (status) {
        case LoanStatus.ACTIVE: return 'default';
        case LoanStatus.RETURNED: return 'secondary';
        case LoanStatus.OVERDUE: return 'destructive';
        default: return 'outline';
    }
};


const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuthStore(); // Pega o usuário do store de autenticação

  // Busca os empréstimos da API ao carregar a página
  useEffect(() => {
    const fetchLoans = async () => {
      setIsLoading(true);
      try {
        // Idealmente, a API filtraria os empréstimos pelo usuário logado
        // Se for admin, poderia buscar todos ?user_id=all ou algo assim
        const response = await api.get('/loans'); // Endpoint da API (precisa ser criado no backend)
        // Filtrando no frontend como fallback (não ideal para performance/segurança)
        if (user && user.role !== 'ADMIN') {
            setLoans(response.data.filter((loan: Loan) => loan.user_id === user.id));
        } else {
            setLoans(response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar empréstimos:", error);
        toast.error('Falha ao carregar empréstimos. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, [user]); // Dependência do usuário para rebuscar se o usuário mudar

  // Função para lidar com a devolução (exemplo)
  const handleReturnLoan = async (loanId: number) => {
      try {
          // Chamada API para marcar o empréstimo como devolvido
          await api.put(`/loans/${loanId}/return`); // Endpoint da API (precisa ser criado no backend)
          toast.success('Livro devolvido com sucesso!');
          // Atualiza a lista de empréstimos localmente ou re-busca da API
          setLoans(prevLoans =>
              prevLoans.map(loan =>
                  loan.id === loanId ? { ...loan, status: LoanStatus.RETURNED, return_date: new Date().toISOString() } : loan
              )
          );
      } catch (error) {
          console.error("Erro ao devolver livro:", error);
          toast.error('Falha ao devolver o livro. Tente novamente.');
      }
  };


  if (isLoading) {
    return <div>Carregando empréstimos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Empréstimos</CardTitle>
      </CardHeader>
      <CardContent>
        {loans.length === 0 ? (
          <p>Você não possui empréstimos ativos no momento.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead>Data Empréstimo</TableHead>
                <TableHead>Data Devolução Prevista</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === 'ADMIN' && <TableHead>Usuário</TableHead>}
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.book?.title ?? 'Livro não encontrado'}</TableCell> {/* Assumindo que a API retorna dados do livro */}
                  <TableCell>{format(new Date(loan.loan_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(loan.status)}>
                        {getStatusText(loan.status)}
                    </Badge>
                  </TableCell>
                   {user?.role === 'ADMIN' && <TableCell>{loan.user?.name ?? 'Usuário não encontrado'}</TableCell>} {/* Assumindo que a API retorna dados do usuário para admin */}
                  <TableCell>
                    {loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.OVERDUE ? (
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnLoan(loan.id)}
                        >
                            Devolver
                        </Button>
                    ): (
                        <span>-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LoansPage; 