import { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, AlertTriangle, BookCopy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store';
import { useBooks } from '@/hooks/useBooks';
import { useUsers } from '@/hooks/useUsers';
import { useLoans } from '@/hooks/useLoans';

function StatCard({ icon: Icon, title, value, description, className = '' }) {
  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function RecentActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((index) => (
        <div key={index} className="flex items-center p-3 rounded-md bg-gray-50 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { books, loading: booksLoading } = useBooks();
  const { users, loading: usersLoading } = useUsers();
  const { loans, loading: loansLoading, getOverdueLoans } = useLoans();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Show loading state while data is being fetched
  useEffect(() => {
    if (!booksLoading && !usersLoading && !loansLoading) {
      // Add a small delay for a smoother transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [booksLoading, usersLoading, loansLoading]);

  // Calculate stats
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.availableCopies > 0).length;
  const totalUsers = users.length;
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const overdueLoans = getOverdueLoans().length;
  const blockedUsers = users.filter(user => user.blockedUntil && new Date(user.blockedUntil) > new Date()).length;

  // Recent book loans (last 5)
  const recentLoans = loans
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
            <p className="text-muted-foreground">
              Bem-vindo(a), {user?.name}!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={BookOpen}
              title="Total de Livros"
              value={totalBooks}
              description={`${availableBooks} disponíveis para empréstimo`}
            />
            <StatCard
              icon={Users}
              title="Total de Usuários"
              value={totalUsers}
              description={`${blockedUsers} bloqueados atualmente`}
            />
            <StatCard
              icon={Clock}
              title="Empréstimos Ativos"
              value={activeLoans}
              description={`${overdueLoans} em atraso`}
              className={overdueLoans > 0 ? "border-red-100" : ""}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimos empréstimos de livros</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLoans.length > 0 ? (
                  <div className="space-y-4">
                    {recentLoans.map((loan) => (
                      <div key={loan.id} className="flex items-start space-x-4">
                        <BookCopy className="h-6 w-6 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{loan.bookTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Emprestado para {loan.userName} em{" "}
                            {new Date(loan.borrowDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum empréstimo recente</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Livros em Atraso</CardTitle>
                <CardDescription>Livros que precisam ser devolvidos</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueLoans > 0 ? (
                  <div className="space-y-4">
                    {getOverdueLoans().slice(0, 5).map((loan) => (
                      <div key={loan.id} className="flex items-start space-x-4">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
                        <div>
                          <p className="font-medium">{loan.bookTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Vencimento em {new Date(loan.dueDate).toLocaleDateString('pt-BR')} ({Math.floor((new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24))} dias em atraso)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Emprestado para {loan.userName}
                          </p>
                        </div>
                      </div>
                    ))}
                    {overdueLoans > 5 && (
                      <Button variant="link" onClick={() => navigate('/loans')} className="px-0">
                        Ver todos os {overdueLoans} empréstimos em atraso
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold">Nenhum livro em atraso</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Todos os livros emprestados estão dentro do prazo
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Tarefas comuns que você pode realizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/books')}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Catálogo</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/loans')}
                  >
                    <Clock className="h-5 w-5" />
                    <span>Empréstimos</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/users')}
                  >
                    <Users className="h-5 w-5" />
                    <span>Usuários</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/reports')}
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span>Relatórios</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuários Bloqueados</CardTitle>
                <CardDescription>Usuários com restrições de empréstimo</CardDescription>
              </CardHeader>
              <CardContent>
                {blockedUsers > 0 ? (
                  <div className="space-y-4">
                    {users
                      .filter(user => user.blockedUntil && new Date(user.blockedUntil) > new Date())
                      .slice(0, 3)
                      .map((user) => (
                        <div key={user.id} className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Bloqueado até {new Date(user.blockedUntil!).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                              {user.blockReason}
                            </p>
                          </div>
                        </div>
                      ))}
                    {blockedUsers > 3 && (
                      <Button variant="link" onClick={() => navigate('/users')} className="px-0">
                        Ver todos os {blockedUsers} usuários bloqueados
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="rounded-full bg-green-50 p-3 mb-3">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="font-semibold">Nenhum usuário bloqueado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Todos os usuários estão em situação regular
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Dashboard;
