import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('@LeiaMais:user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem('@LeiaMais:user', JSON.stringify(user));
    } else {
      localStorage.removeItem('@LeiaMais:user');
    }
  }, [user]);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { user: userData, token } = response.data;

      localStorage.setItem('@LeiaMais:token', token);
      api.defaults.headers.authorization = `Bearer ${token}`;

      setUser(userData);
    } catch (error) {
      throw new Error('Falha na autenticação');
    }
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('@LeiaMais:token');
    localStorage.removeItem('@LeiaMais:user');
    delete api.defaults.headers.authorization;
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 