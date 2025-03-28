import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book as BookIcon, Plus, Search, Edit, Trash2, Copy, ArrowUpDown, Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBooks, Book } from '@/hooks/useBooks';
import { useLoans } from '@/hooks/useLoans';
import { useAuth } from '@/hooks/useAuth';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface BookFormProps {
  initialData?: Partial<Book>;
  onSubmit: (data: Partial<Book>) => void;
  onCancel: () => void;
}

function BookForm({ initialData, onSubmit, onCancel }: BookFormProps) {
  const [formData, setFormData] = useState<Partial<Book>>(
    initialData || {
      isbn: '',
      title: '',
      author: '',
      genre: '',
      totalCopies: 1,
      availableCopies: 1,
      location: '',
      status: 'available',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseInt(value, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            name="isbn"
            value={formData.isbn || ''}
            onChange={handleChange}
            placeholder="9780061122415"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            placeholder="Título do Livro"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author">Autor</Label>
          <Input
            id="author"
            name="author"
            value={formData.author || ''}
            onChange={handleChange}
            placeholder="Nome do Autor"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">Gênero</Label>
          <Input
            id="genre"
            name="genre"
            value={formData.genre || ''}
            onChange={handleChange}
            placeholder="Ficção, Não-Ficção, etc."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalCopies">Total de Cópias</Label>
          <Input
            id="totalCopies"
            name="totalCopies"
            type="number"
            min="1"
            value={formData.totalCopies || 1}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableCopies">Cópias Disponíveis</Label>
          <Input
            id="availableCopies"
            name="availableCopies"
            type="number"
            min="0"
            max={formData.totalCopies || 1}
            value={formData.availableCopies === undefined ? formData.totalCopies : formData.availableCopies}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            placeholder="Seção A, Prateleira 1"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">URL da Capa (Opcional)</Label>
        <Input
          id="coverImage"
          name="coverImage"
          value={formData.coverImage || ''}
          onChange={handleChange}
          placeholder="https://exemplo.com/capa.jpg"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData?.id ? 'Atualizar Livro' : 'Adicionar Livro'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function Books() {
  const { books, loading, addBook, updateBook, deleteBook } = useBooks();
  const { loans, borrowBook } = useLoans();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleAddBook = (bookData: Partial<Book>) => {
    if (!bookData.id) {
      // Ensure availableCopies defaults to totalCopies for new books
      if (bookData.availableCopies === undefined) {
        bookData.availableCopies = bookData.totalCopies;
      }
      
      addBook(bookData as Omit<Book, 'id'>);
    }
    setIsAddDialogOpen(false);
  };

  const handleEditBook = (bookData: Partial<Book>) => {
    if (selectedBook && bookData) {
      updateBook(selectedBook.id, bookData);
    }
    setIsEditDialogOpen(false);
  };

  const handleDeleteBook = () => {
    if (selectedBook) {
      deleteBook(selectedBook.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';

  const columns: ColumnDef<Book>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {row.original.coverImage ? (
            <img 
              src={row.original.coverImage} 
              alt={row.original.title} 
              className="w-10 h-14 object-cover rounded-sm" 
            />
          ) : (
            <div className="w-10 h-14 bg-muted flex items-center justify-center rounded-sm">
              <BookIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">ISBN: {row.original.isbn}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
    },
    {
      accessorKey: 'genre',
      header: 'Genre',
    },
    {
      accessorKey: 'availableCopies',
      header: 'Available',
      cell: ({ row }) => (
        <div>
          {row.original.availableCopies} / {row.original.totalCopies}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <div className="h-4 w-4">⋮</div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigate(`/books/${row.original.id}`);
              }}
            >
              <BookIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {isLibrarian && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBook(row.original);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBook(row.original);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Carregando livros...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
              <p className="text-muted-foreground">
                Gerencie o acervo da biblioteca
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Livro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Livro</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do livro abaixo
                  </DialogDescription>
                </DialogHeader>
                <BookForm
                  onSubmit={handleAddBook}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por título, autor, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todos os Livros</CardTitle>
              <CardDescription>
                Uma lista completa de todos os livros no acervo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={books.filter(book =>
                  book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.isbn.includes(searchQuery)
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Livro</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do livro abaixo
              </DialogDescription>
            </DialogHeader>
            {selectedBook && (
              <BookForm
                initialData={selectedBook}
                onSubmit={handleEditBook}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteBook}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}

export default Books;
