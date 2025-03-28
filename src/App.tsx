
import React from 'react';
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

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Users from "./pages/Users";
import Loans from "./pages/Loans";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <BooksProvider>
              <UsersProvider>
                <LoansProvider>
                  <div className="min-h-screen bg-gray-50 flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      <AnimatePresence mode="wait">
                        <Routes>
                          <Route path="/" element={<Navigate to="/login" replace />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/books" element={<Books />} />
                          <Route path="/users" element={<Users />} />
                          <Route path="/loans" element={<Loans />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AnimatePresence>
                    </main>
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

export default App;
