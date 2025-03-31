import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/hooks/useAuth';
import { BooksProvider } from '@/hooks/useBooks';
import { UsersProvider } from '@/hooks/useUsers';
import { LoansProvider } from '@/hooks/useLoans';
import { Navbar } from '@/components/Navbar';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store';
import { useThemeStore } from './store';
import { UserRole } from '@/types';
import LoansPage from './pages/LoansPage';
import { Router } from './Router';
import './styles/globals.css';
import { Toaster as ReactHotToaster } from 'react-hot-toast';

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Users from "./pages/Users";
import Loans from "./pages/Loans";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Index from './pages/Index'; // Renamed from HomePage
// RegisterPage removed - file doesn't exist
// BookDetailsPage removed - file doesn't exist
// AdminDashboard removed - file doesn't exist (Using Dashboard instead)

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: JSX.Element, roles?: UserRole[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { theme } = useThemeStore();
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme);
  }, [theme]);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <BooksProvider>
                <UsersProvider>
                  <LoansProvider>
                    <div className="min-h-screen bg-background">
                      <Router />
                      <ReactHotToaster
                        position="top-right"
                        toastOptions={{
                          style: {
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                          },
                          duration: 3000,
                        }}
                      />
                    </div>
                    <Toaster />
                    <Sonner />
                  </LoansProvider>
                </UsersProvider>
              </BooksProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
