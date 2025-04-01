import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useBooks } from '@/hooks/useBooks';
import { useUsers } from '@/hooks/useUsers';
import { useLoans, LoanWithDetails } from '@/hooks/useLoans';
import { useAuth } from '@/hooks/useAuth';
import { FileDown, Download, UserX, BookOpen, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateLoansReport, generateBlockedUsersReport, generateInventoryReport } from '@/utils/pdfGenerator';

export function Reports() {
  const { books } = useBooks();
  const { users } = useUsers();
  const { loans, getOverdueLoans } = useLoans();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('monthly-loans');

  // Detecta se o tema atual é dark
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Verifica se o usuário tem permissão para acessar relatórios
  if (user?.role !== 'admin' && user?.role !== 'librarian') {
    navigate('/dashboard');
    return null;
  }

  // Obtém o nome do mês atual e o ano
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Filtra empréstimos do mês atual
  const currentMonthLoans = loans.filter(loan => {
    const loanDate = new Date(loan.borrowDate);
    return loanDate.getMonth() === new Date().getMonth() &&
           loanDate.getFullYear() === new Date().getFullYear();
  });

  // Obtém todos os usuários bloqueados
  const blockedUsers = users.filter(user => 
    user.blockedUntil && new Date(user.blockedUntil) > new Date()
  );

  // Obtém todos os livros (inventário)
  const inventory = books;

  // Colunas para o relatório de empréstimos mensais
  const loanColumns: ColumnDef<LoanWithDetails>[] = [
    {
      accessorKey: 'bookTitle',
      header: 'Título do Livro',
    },
    {
      accessorKey: 'userName',
      header: 'Usuário',
    },
    {
      accessorKey: 'borrowDate',
      header: 'Data do Empréstimo',
      cell: ({ row }) => new Date(row.original.borrowDate).toLocaleDateString('pt-BR')
    },
    {
      accessorKey: 'dueDate',
      header: 'Data de Devolução',
      cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString('pt-BR')
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const today = new Date();
        const dueDate = new Date(row.original.dueDate);
        const status = row.original.status === 'active' && dueDate < today ? 'atrasado' : 
          row.original.status === 'active' ? 'em andamento' : 'devolvido';
        return <span className="capitalize">{status}</span>;
      }
    },
  ];

  // Colunas para o relatório de usuários bloqueados
  const blockedUserColumns: ColumnDef<typeof blockedUsers[0]>[] = [
    {
      accessorKey: 'name',
      header: 'Nome do Usuário',
    },
    {
      accessorKey: 'email',
      header: 'E-mail',
    },
    {
      accessorKey: 'role',
      header: 'Função',
      cell: ({ row }) => {
        const roleMap = {
          student: 'Aluno',
          teacher: 'Professor',
          librarian: 'Bibliotecário',
          admin: 'Administrador'
        };
        return roleMap[row.original.role as keyof typeof roleMap] || row.original.role;
      }
    },
    {
      accessorKey: 'blockedUntil',
      header: 'Bloqueado Até',
      cell: ({ row }) => new Date(row.original.blockedUntil!).toLocaleDateString('pt-BR')
    },
    {
      accessorKey: 'blockReason',
      header: 'Motivo',
    },
  ];

  // Colunas para o relatório de inventário
  const inventoryColumns: ColumnDef<typeof inventory[0]>[] = [
    {
      accessorKey: 'title',
      header: 'Título',
    },
    {
      accessorKey: 'author',
      header: 'Autor',
    },
    {
      accessorKey: 'isbn',
      header: 'ISBN',
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantidade',
    },
    {
      accessorKey: 'available',
      header: 'Disponíveis',
    },
  ];

  const handleDownloadReport = () => {
    let doc;
    switch (activeTab) {
      case 'monthly-loans':
        doc = generateLoansReport(currentMonthLoans, isDarkMode);
        doc.save(`relatorio-emprestimos-${currentMonth}-${currentYear}.pdf`);
        break;
      case 'blocked-users':
        doc = generateBlockedUsersReport(blockedUsers, isDarkMode);
        doc.save(`relatorio-usuarios-bloqueados-${new Date().toLocaleDateString('pt-BR')}.pdf`);
        break;
      case 'inventory':
        doc = generateInventoryReport(inventory, isDarkMode);
        doc.save(`relatorio-inventario-${new Date().toLocaleDateString('pt-BR')}.pdf`);
        break;
      default:
        break;
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <Button onClick={handleDownloadReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="monthly-loans" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Empréstimos Mensais
            </TabsTrigger>
            <TabsTrigger value="blocked-users" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Usuários Bloqueados
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Inventário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly-loans">
            <Card>
              <CardHeader>
                <CardTitle>Empréstimos do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={loanColumns}
                  data={currentMonthLoans}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked-users">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Bloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={blockedUserColumns}
                  data={blockedUsers}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventário de Livros</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={inventoryColumns}
                  data={inventory}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

export default Reports;
