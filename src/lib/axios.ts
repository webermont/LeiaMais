import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Criando instância do axios com configurações base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Obtém o token do localStorage
    const token = localStorage.getItem('token');
    
    // Se houver token, adiciona ao header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros comuns
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Não autorizado - Redireciona para login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente.",
            variant: "destructive",
          });
          break;
        
        case 403:
          // Acesso negado
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para realizar esta ação.",
            variant: "destructive",
          });
          break;
        
        case 404:
          // Não encontrado
          toast({
            title: "Não encontrado",
            description: "O recurso solicitado não existe.",
            variant: "destructive",
          });
          break;
        
        case 422:
          // Erro de validação
          const errors = error.response.data.errors;
          if (errors) {
            Object.keys(errors).forEach((key) => {
              toast({
                title: "Erro de validação",
                description: errors[key][0],
                variant: "destructive",
              });
            });
          }
          break;
        
        case 500:
          // Erro interno do servidor
          toast({
            title: "Erro no servidor",
            description: "Ocorreu um erro interno. Tente novamente mais tarde.",
            variant: "destructive",
          });
          break;
        
        default:
          // Outros erros
          toast({
            title: "Erro",
            description: "Ocorreu um erro na requisição.",
            variant: "destructive",
          });
      }
    } else if (error.request) {
      // Erro de conexão
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

export default api; 