import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { PageTransition } from '@/components/PageTransition';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Login will handle redirection on success
    } catch (error) {
      // Error is handled in the login function
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
