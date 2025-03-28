import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  name: string;
  to: string;
  role: string[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', role: ['admin', 'librarian', 'teacher', 'student'] },
  { name: 'Books', to: '/books', role: ['admin', 'librarian', 'teacher', 'student'] },
  { name: 'Users', to: '/users', role: ['admin', 'librarian'] },
  { name: 'Loans', to: '/loans', role: ['admin', 'librarian'] },
  { name: 'Reports', to: '/reports', role: ['admin', 'librarian'] },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    item.role.includes(user?.role || '')
  );

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-medium">LeiaMais</span>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ease-in-out',
                    location.pathname === item.to
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground ml-1 capitalize">({user.role})</span>
                </div>
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Link to="/login">
                  <Button variant="default">Entrar</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menu principal</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1 bg-background shadow-lg rounded-b-lg border-t border-border animate-slideIn">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={cn(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                  location.pathname === item.to
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="border-t border-border pt-4 pb-3">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center">
                    <div className="text-base font-medium">
                      {user.name}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-5 w-5 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-2 pb-3 px-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Entrar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
