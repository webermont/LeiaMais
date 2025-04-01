import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import { toast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/PageTransition';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mock login - check if user exists and password is correct
      const mockUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@biblioteca.com',
          role: 'admin' as const,
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
          role: 'librarian' as const,
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
          role: 'teacher' as const,
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
          role: 'student' as const,
          borrow_limit: 3,
          borrow_duration: 10,
          blocked_until: null,
          block_reason: null,
          active_loans: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-primary bg-opacity-10 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900">LeiaMais</h2>
            <p className="mt-2 text-gray-600">Sistema de Biblioteca</p>
          </div>
          
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Digite suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@escola.edu.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Button variant="link" className="p-0 h-auto text-xs" type="button">
                      Esqueceu a senha?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-sm text-center text-muted-foreground mt-2">
                <p>Contas de demonstração:</p>
                <p className="mt-1">
                  admin@biblioteca.com / bibliotecario@biblioteca.com / professor@biblioteca.com / aluno@biblioteca.com
                </p>
                <p className="mt-1">Senha: senha123</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

export default Login;
