import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { ThemeSelector } from '../ThemeSelector';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = () => {
    logout();
    localStorage.removeItem('leiamais.token');
    localStorage.removeItem('leiamais.user');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
              LeiaMais
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
                isActive('/') ? 'font-semibold' : ''
              }`}
            >
              Início
            </Link>
            <Link
              to="/books"
              className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
                isActive('/books') ? 'font-semibold' : ''
              }`}
            >
              Livros
            </Link>
            {user && (
              <>
                <Link
                  to="/loans"
                  className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
                    isActive('/loans') ? 'font-semibold' : ''
                  }`}
                >
                  Empréstimos
                </Link>
                <Link
                  to="/users"
                  className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
                    isActive('/users') ? 'font-semibold' : ''
                  }`}
                >
                  Usuários
                </Link>
                <Link
                  to="/reports"
                  className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
                    isActive('/reports') ? 'font-semibold' : ''
                  }`}
                >
                  Relatórios
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">
                Alternar tema {theme === 'dark' ? 'claro' : 'escuro'}
              </span>
            </Button>
            {user ? (
              <>
                <span className="text-gray-600 dark:text-gray-300">
                  {user.name}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button>Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 