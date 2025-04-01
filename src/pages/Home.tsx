import { useAuthStore } from "@/store";
import { BookOpen, Users, Clock } from 'lucide-react';

export const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao LeiaMais</h1>
        <p className="text-xl text-muted-foreground">
          Sistema de Gerenciamento de Biblioteca
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Livros Disponíveis</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Explore nossa coleção de livros e encontre sua próxima leitura.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Empréstimos Ativos</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Acompanhe seus empréstimos e datas de devolução.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Reservas</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Gerencie suas reservas de livros.
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Desenvolvido por Wéber Monteiro</p>
        <p className="mt-2">© {new Date().getFullYear()} LeiaMais. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}; 