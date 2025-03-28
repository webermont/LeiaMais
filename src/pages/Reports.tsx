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

export function Reports() {
  const { books } = useBooks();
  const { users } = useUsers();
  const { loans, getOverdueLoans } = useLoans();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('monthly-loans');

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
        return <span className="capitalize">{roleMap[row.original.role as keyof typeof roleMap]}</span>;
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
      cell: ({ row }) => row.original.blockReason || 'N/A'
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
      accessorKey: 'genre',
      header: 'Gênero',
    },
    {
      accessorKey: 'totalCopies',
      header: 'Total de Cópias',
    },
    {
      accessorKey: 'availableCopies',
      header: 'Disponíveis',
    },
    {
      accessorKey: 'location',
      header: 'Localização',
    },
  ];

  const handleDownloadReport = () => {
    // Em uma aplicação real, isso geraria um arquivo PDF/Excel
    alert('Em uma aplicação real, isso baixaria o relatório atual como PDF ou Excel.');
  };

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
              <p className="text-muted-foreground">
                Gere e visualize relatórios do sistema da biblioteca
              </p>
            </div>
            
            <Button onClick={handleDownloadReport}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-blue-800">
                  <Calendar className="mr-2 h-4 w-4" />
                  Empréstimos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{currentMonthLoans.length}</div>
                <p className="text-xs text-blue-700">{currentMonth} {currentYear}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-red-800">
                  <UserX className="mr-2 h-4 w-4" />
                  Usuários Bloqueados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{blockedUsers.length}</div>
                <p className="text-xs text-red-700">Atualmente restritos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-green-800">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Inventário Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{inventory.length}</div>
                <p className="text-xs text-green-700">Livros no catálogo</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="monthly-loans" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="monthly-loans">Empréstimos Mensais</TabsTrigger>
              <TabsTrigger value="blocked-users">Usuários Bloqueados</TabsTrigger>
              <TabsTrigger value="inventory">Inventário</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly-loans">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Relatório de Empréstimos: {currentMonth} {currentYear}
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-3 w-3" />
                    Exportar
                  </Button>
                </div>
                
                <DataTable 
                  columns={loanColumns} 
                  data={currentMonthLoans} 
                  searchKey="bookTitle"
                  searchPlaceholder="Pesquisar por título do livro ou usuário..."
                />
              </div>
            </TabsContent>
            
            <TabsContent value="blocked-users">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Relatório de Usuários Bloqueados
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-3 w-3" />
                    Exportar
                  </Button>
                </div>
                
                {blockedUsers.length > 0 ? (
                  <DataTable 
                    columns={blockedUserColumns} 
                    data={blockedUsers} 
                    searchKey="name"
                    searchPlaceholder="Pesquisar por nome ou e-mail..."
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserX className="mx-auto h-10 w-10 mb-2 opacity-20" />
                    <p>Nenhum usuário bloqueado no momento</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="inventory">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Relatório Completo do Inventário
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-3 w-3" />
                    Exportar
                  </Button>
                </div>
                
                <DataTable 
                  columns={inventoryColumns} 
                  data={inventory} 
                  searchKey="title"
                  searchPlaceholder="Pesquisar por título, autor ou ISBN..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}

export default Reports;
