import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Plus, UserCheck, UserX, Edit, Trash2, ArrowUpDown, Clock, Calendar, BookOpen } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, User } from '@/hooks/useUsers';
import { Badge } from '@/components/ui/badge';

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
}

function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User>>(
    initialData || {
      name: '',
      email: '',
      role: 'student',
      borrowLimit: 3,
      borrowDuration: 7,
      blockedUntil: null,
      activeLoans: 0,
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

  const handleRoleChange = (value: string) => {
    let borrowLimit = 3;
    let borrowDuration = 7;
    
    if (value === 'teacher') {
      borrowLimit = 5;
      borrowDuration = 30;
    } else if (value === 'librarian' || value === 'admin') {
      borrowLimit = 0;
      borrowDuration = 0;
    }
    
    setFormData({ 
      ...formData, 
      role: value as User['role'],
      borrowLimit,
      borrowDuration,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="João Silva"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="joao.silva@escola.edu.br"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função</Label>
        <Select
          value={formData.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Aluno</SelectItem>
            <SelectItem value="teacher">Professor</SelectItem>
            <SelectItem value="librarian">Bibliotecário</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {formData.role === 'student' && 'Alunos podem emprestar até 3 livros por 7 dias.'}
          {formData.role === 'teacher' && 'Professores podem emprestar até 5 livros por 30 dias.'}
          {(formData.role === 'librarian' || formData.role === 'admin') && 'Bibliotecários e administradores têm acesso total ao sistema.'}
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData?.id ? 'Atualizar Usuário' : 'Adicionar Usuário'}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface BlockUserFormProps {
  userId: number;
  userName: string;
  onSubmit: (days: number, reason: string) => void;
  onCancel: () => void;
}

function BlockUserForm({ userId, userName, onSubmit, onCancel }: BlockUserFormProps) {
  const [days, setDays] = useState(3);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(days, reason);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Você está prestes a bloquear o usuário: <span className="font-semibold">{userName}</span>
      </p>
      
      <div className="space-y-2">
        <Label htmlFor="days">Duração do Bloqueio (dias)</Label>
        <Input
          id="days"
          type="number"
          min="1"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value, 10))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reason">Motivo</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Atraso na devolução de livros"
          required
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="destructive">
          Bloquear Usuário
        </Button>
      </DialogFooter>
    </form>
  );
}

export function Users() {
  const { users, loading, addUser, updateUser, deleteUser, blockUser, unblockUser } = useUsers();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = (userData: Partial<User>) => {
    if (!userData.id) {
      addUser(userData as Omit<User, 'id'>);
    }
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (userData: Partial<User>) => {
    if (selectedUser && userData) {
      updateUser(selectedUser.id, userData);
    }
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleBlockUser = (days: number, reason: string) => {
    if (selectedUser) {
      blockUser(selectedUser.id, days, reason);
    }
    setIsBlockDialogOpen(false);
  };

  const handleUnblockUser = () => {
    if (selectedUser) {
      unblockUser(selectedUser.id);
    }
    setIsUnblockDialogOpen(false);
  };

  const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';
  
  const isUserBlocked = (user: User) => {
    return user.blockedUntil && new Date(user.blockedUntil) > new Date();
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="font-semibold">{row.original.name.charAt(0)}</span>
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Função',
      cell: ({ row }) => {
        const role = row.original.role;
        const roleMap = {
          student: 'Aluno',
          teacher: 'Professor',
          librarian: 'Bibliotecário',
          admin: 'Administrador'
        };
        return (
          <div className="capitalize">
            {roleMap[role as keyof typeof roleMap]}
          </div>
        );
      },
    },
    {
      accessorKey: 'borrowLimit',
      header: 'Empréstimos',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="flex items-center mr-2 text-sm">
            <BookOpen className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>{row.original.activeLoans}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span>{row.original.borrowLimit || '∞'}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>{row.original.borrowDuration || '∞'} dias</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const blocked = isUserBlocked(row.original);
        return (
          <div className="flex items-center">
            {blocked ? (
              <Badge variant="destructive" className="flex items-center">
                <UserX className="h-3 w-3 mr-1" />
                <span>Bloqueado</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center text-green-500 bg-green-50 border-green-100">
                <UserCheck className="h-3 w-3 mr-1" />
                <span>Ativo</span>
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'blockedUntil',
      header: 'Bloqueio',
      cell: ({ row }) => {
        const user = row.original;
        const blocked = isUserBlocked(user);
        
        if (!blocked) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        
        return (
          <div className="text-sm">
            <div className="flex items-center text-destructive">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Até {new Date(user.blockedUntil!).toLocaleDateString('pt-BR')}</span>
            </div>
            {user.blockReason && (
              <div className="text-xs text-muted-foreground mt-1 italic">
                {user.blockReason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <div className="h-4 w-4">⋮</div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigate(`/users/${row.original.id}`);
              }}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Ver Perfil
            </DropdownMenuItem>
            {isLibrarian && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(row.original);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(row.original);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
                
                {isUserBlocked(row.original) ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedUser(row.original);
                      setIsUnblockDialogOpen(true);
                    }}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Desbloquear Usuário
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedUser(row.original);
                      setIsBlockDialogOpen(true);
                    }}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Bloquear Usuário
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const blockedUsers = users.filter(u => isUserBlocked(u)).length;

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
              <p className="text-muted-foreground">
                Gerencie os usuários e suas permissões
              </p>
            </div>
            
            {isLibrarian && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Adicione um novo usuário ao sistema da biblioteca
                    </DialogDescription>
                  </DialogHeader>
                  <UserForm 
                    onSubmit={handleAddUser}
                    onCancel={() => setIsAddDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'student').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Professores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'teacher').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usuários Bloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {blockedUsers}
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable 
            columns={columns} 
            data={users} 
            searchKey="name"
            searchPlaceholder="Pesquisar por nome ou e-mail..."
          />
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Atualizar informações do usuário
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <UserForm 
                  initialData={selectedUser}
                  onSubmit={handleEditUser}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir {selectedUser?.name}? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser}>
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Bloquear Usuário</DialogTitle>
                <DialogDescription>
                  Bloquear este usuário de fazer empréstimos
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <BlockUserForm 
                  userId={selectedUser.id}
                  userName={selectedUser.name}
                  onSubmit={handleBlockUser}
                  onCancel={() => setIsBlockDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Desbloqueio</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja desbloquear {selectedUser?.name}? O usuário poderá fazer empréstimos imediatamente.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUnblockDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUnblockUser}>
                  Desbloquear Usuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}

export default Users;
