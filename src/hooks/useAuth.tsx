import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from './use-toast';
import { useAuthStore } from '@/store';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

// Mock data - This would be replaced by actual API calls
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@biblioteca.com',
    role: 'admin' as UserRole,
    borrow_limit: 10,
    borrow_duration: 30,
    blocked_until: null,
    block_reason: null,
    active_loans: 0,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: 'Librarian User',
    email: 'bibliotecario@biblioteca.com',
    role: 'librarian' as UserRole,
    borrow_limit: 5,
    borrow_duration: 15,
    blocked_until: null,
    block_reason: null,
    active_loans: 0,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    name: 'Teacher User',
    email: 'professor@biblioteca.com',
    role: 'teacher' as UserRole,
    borrow_limit: 8,
    borrow_duration: 20,
    blocked_until: null,
    block_reason: null,
    active_loans: 0,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 4,
    name: 'Student User',
    email: 'aluno@biblioteca.com',
    role: 'student' as UserRole,
    borrow_limit: 3,
    borrow_duration: 10,
    blocked_until: null,
    block_reason: null,
    active_loans: 0,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Create context
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const { setUser, user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('leiamais.user');
    const storedToken = localStorage.getItem('leiamais.token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  async function signIn(email: string, password: string) {
    try {
      // Mock login - check if user exists and password is correct
      const user = mockUsers.find(u => u.email === email);
      
      if (!user || password !== 'senha123') {
        throw new Error('Credenciais inválidas');
      }

      // Mock token
      const token = 'mock-token-' + Math.random().toString(36).substring(7);

      localStorage.setItem('leiamais.token', token);
      localStorage.setItem('leiamais.user', JSON.stringify(user));

      setUser(user);
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo(a), ${user.name}!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Falha no login',
        description: error instanceof Error ? error.message : 'Ocorreu um erro durante o login',
        variant: 'destructive',
      });
      throw error;
    }
  }

  function signOut() {
    logout();
    localStorage.removeItem('leiamais.token');
    localStorage.removeItem('leiamais.user');
    toast({
      title: 'Desconectado',
      description: 'Você foi desconectado com sucesso.',
    });
    navigate('/login');
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signIn, 
        signOut, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
