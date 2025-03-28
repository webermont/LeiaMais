import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, Calendar, Plus, ArrowUpDown, CheckCircle, AlertCircle, Clock, BookOpen, User as UserIcon, Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import { useBooks, Book } from '@/hooks/useBooks';
import { useUsers, User } from '@/hooks/useUsers';
import { useLoans } from '@/hooks/useLoans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface LoanWithDetails {
  id: number;
  bookId: number;
  userId: number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'returned' | 'overdue';
  renewalCount: number;
  bookTitle: string;
  userName: string;
  userRole: string;
}

interface NewLoanFormProps {
  onSubmit: (bookId: number, userId: number) => void;
  onCancel: () => void;
}

function NewLoanForm({ onSubmit, onCancel }: NewLoanFormProps) {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const { books } = useBooks();
  const { users } = useUsers();
  
  const availableBooks = books.filter(book => book.availableCopies > 0);
  const eligibleUsers = users.filter(user => 
    (user.role === 'student' || user.role === 'teacher') &&
    (!user.blockedUntil || new Date(user.blockedUntil) <= new Date())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookId && selectedUserId) {
      onSubmit(selectedBookId, selectedUserId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="book">Livro</Label>
        <Select
          value={selectedBookId?.toString() || ''}
          onValueChange={(value) => setSelectedBookId(parseInt(value, 10))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um livro" />
          </SelectTrigger>
          <SelectContent>
            {availableBooks.length > 0 ? (
              availableBooks.map((book) => (
                <SelectItem key={book.id} value={book.id.toString()}>
                  {book.title} ({book.availableCopies} disponíveis)
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                Nenhum livro disponível para empréstimo
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user">Usuário</Label>
        <Select
          value={selectedUserId?.toString() || ''}
          onValueChange={(value) => setSelectedUserId(parseInt(value, 10))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um usuário" />
          </SelectTrigger>
          <SelectContent>
            {eligibleUsers.length > 0 ? (
              eligibleUsers.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name} ({user.role === 'student' ? 'Aluno' : 'Professor'})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                Nenhum usuário elegível encontrado
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {selectedBookId && selectedUserId && (
        <div className="bg-blue-50 p-3 rounded-md text-sm">
          <p className="font-medium text-blue-800">Resumo do Empréstimo</p>
          <div className="mt-2 space-y-1 text-blue-700">
            <p>
              <strong>Livro:</strong> {books.find(b => b.id === selectedBookId)?.title}
            </p>
            <p>
              <strong>Usuário:</strong> {users.find(u => u.id === selectedUserId)?.name}
            </p>
            <p>
              <strong>Período de Empréstimo:</strong> {users.find(u => u.id === selectedUserId)?.borrowDuration} dias
            </p>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={!selectedBookId || !selectedUserId}
        >
          Criar Empréstimo
        </Button>
      </DialogFooter>
    </form>
  );
}

interface ReturnBookFormProps {
  loan: LoanWithDetails;
  onSubmit: () => void;
  onCancel: () => void;
}

function ReturnBookForm({ loan, onSubmit, onCancel }: ReturnBookFormProps) {
  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  const isOverdue = today > dueDate;
  
  const daysDiff = isOverdue 
    ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  let penaltyDays = 0;
  if (daysDiff > 0) {
    penaltyDays = daysDiff <= 3 ? 3 : 7;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold mb-2">Detalhes do Empréstimo</h3>
        <p><strong>Livro:</strong> {loan.bookTitle}</p>
        <p><strong>Emprestado para:</strong> {loan.userName}</p>
        <p><strong>Data do empréstimo:</strong> {new Date(loan.borrowDate).toLocaleDateString('pt-BR')}</p>
        <p><strong>Data de devolução:</strong> {new Date(loan.dueDate).toLocaleDateString('pt-BR')}</p>
        
        {isOverdue && (
          <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100 text-red-800">
            <p className="font-semibold flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {daysDiff} dia{daysDiff !== 1 ? 's' : ''} em atraso
            </p>
            <p className="mt-1 text-sm">
              Esta devolução resultará em um bloqueio de {penaltyDays} dias para o usuário.
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" onClick={onSubmit}>
          Confirmar Devolução
        </Button>
      </DialogFooter>
    </div>
  );
}

interface LoansContextType {
  loans: LoanWithDetails[];
  loading: boolean;
  borrowBook: (bookId: number, userId: number) => Promise<void>;
  returnBook: (loanId: number) => Promise<void>;
  getOverdueLoans: () => LoanWithDetails[];
}

export function Loans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans, loading, borrowBook, returnBook, getOverdueLoans } = useLoans();
  const [isNewLoanDialogOpen, setIsNewLoanDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';

  const handleCreateLoan = (bookId: number, userId: number) => {
    borrowBook(bookId, userId);
    setIsNewLoanDialogOpen(false);
  };

  const handleReturnBook = () => {
    if (selectedLoan) {
      returnBook(selectedLoan.id);
    }
    setIsReturnDialogOpen(false);
  };

  const filteredLoans = (() => {
    switch (activeTab) {
      case 'active':
        return loans.filter(loan => loan.status === 'active');
      case 'overdue':
        return getOverdueLoans();
      case 'returned':
        return loans.filter(loan => loan.status === 'returned');
      default:
        return loans;
    }
  })();

  const columns: ColumnDef<LoanWithDetails>[] = [
    {
      accessorKey: "bookTitle",
      header: "Livro",
    },
    {
      accessorKey: "userName", 
      header: "Usuário",
    },
    {
      accessorKey: "borrowDate",
      header: "Data do Empréstimo",
      cell: ({ row }) => new Date(row.getValue("borrowDate")).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: "dueDate",
      header: "Data de Devolução",
      cell: ({ row }) => {
        const dueDate = new Date(row.getValue("dueDate"));
        const today = new Date();
        const isOverdue = today > dueDate;
        
        return (
          <div className={cn("flex items-center gap-2", {
            "text-red-600": isOverdue,
          })}>
            {isOverdue && <AlertCircle className="h-4 w-4" />}
            {dueDate.toLocaleDateString('pt-BR')}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Em Andamento" : "Devolvido"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const loan = row.original;
        
        if (loan.status === "returned") {
          return null;
        }
        
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedLoan(loan);
              setIsReturnDialogOpen(true);
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Devolver
          </Button>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Carregando empréstimos...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Empréstimos</h1>
              <p className="text-muted-foreground">
                Gerencie os empréstimos da biblioteca
              </p>
            </div>
            
            {isLibrarian && (
              <Dialog open={isNewLoanDialogOpen} onOpenChange={setIsNewLoanDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Empréstimo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Novo Empréstimo</DialogTitle>
                    <DialogDescription>
                      Selecione o livro e o usuário para criar um novo empréstimo
                    </DialogDescription>
                  </DialogHeader>
                  <NewLoanForm 
                    onSubmit={handleCreateLoan}
                    onCancel={() => setIsNewLoanDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Empréstimos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loans.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loans.filter(l => l.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {getOverdueLoans().length}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="overdue">Em Atraso</TabsTrigger>
              <TabsTrigger value="returned">Devolvidos</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <DataTable 
                columns={columns} 
                data={filteredLoans} 
                searchKey="bookTitle"
                searchPlaceholder="Pesquisar por título do livro..."
              />
            </TabsContent>
          </Tabs>
          
          <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Devolver Livro</DialogTitle>
                <DialogDescription>
                  Confirme a devolução do livro
                </DialogDescription>
              </DialogHeader>
              {selectedLoan && (
                <ReturnBookForm 
                  loan={selectedLoan}
                  onSubmit={handleReturnBook}
                  onCancel={() => setIsReturnDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}

export default Loans;
