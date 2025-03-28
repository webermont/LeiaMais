import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'librarian' | 'teacher' | 'student';
  blockedUntil?: string | null;
  borrowLimit: number;
  borrowDuration: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkUserBlocked: () => { isBlocked: boolean; until: string | null };
}

// Mock data - This would be replaced by actual API calls
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@biblioteca.com',
    role: 'admin',
    borrowLimit: 0,
    borrowDuration: 0,
  },
  {
    id: 2,
    name: 'Librarian User',
    email: 'bibliotecario@biblioteca.com',
    role: 'librarian',
    borrowLimit: 0,
    borrowDuration: 0,
  },
  {
    id: 3,
    name: 'Teacher User',
    email: 'professor@biblioteca.com',
    role: 'teacher',
    borrowLimit: 5,
    borrowDuration: 30,
  },
  {
    id: 4,
    name: 'Student User',
    email: 'aluno@biblioteca.com',
    role: 'student',
    blockedUntil: '2023-12-31',
    borrowLimit: 3,
    borrowDuration: 7,
  },
];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (mock implementation)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }
      
      // In a real app, you would validate password here
      if (password !== 'senha123') {
        throw new Error('Credenciais inválidas');
      }
      
      // Set user in state and local storage
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo(a), ${foundUser.name}!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Falha no login',
        description: error instanceof Error ? error.message : 'Ocorreu um erro durante o login',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: 'Desconectado',
      description: 'Você foi desconectado com sucesso.',
    });
    navigate('/login');
  };

  // Check if user is blocked
  const checkUserBlocked = () => {
    if (!user || !user.blockedUntil) {
      return { isBlocked: false, until: null };
    }
    
    const blockedUntil = new Date(user.blockedUntil);
    const now = new Date();
    
    return {
      isBlocked: blockedUntil > now,
      until: user.blockedUntil,
    };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkUserBlocked }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
