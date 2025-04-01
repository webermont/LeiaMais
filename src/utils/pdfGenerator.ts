import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LoanWithDetails } from '@/hooks/useLoans';
import { User } from '@/types';

interface GeneratePDFOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: {
    header: string;
    accessor: string;
    formatter?: (value: any) => string;
  }[];
  isDarkMode?: boolean;
}

export function generatePDF({ title, subtitle, data, columns, isDarkMode = false }: GeneratePDFOptions) {
  const doc = new jsPDF();
  
  // Cores baseadas no tema
  const colors = {
    light: {
      header: [41, 128, 185], // Azul
      text: [0, 0, 0], // Preto
      alternateRow: [245, 245, 245], // Cinza claro
      headerText: 255 // Branco
    },
    dark: {
      header: [30, 41, 59], // Slate 800
      text: [255, 255, 255], // Branco
      alternateRow: [51, 65, 85], // Slate 700
      headerText: 255 // Branco
    }
  };

  const theme = isDarkMode ? colors.dark : colors.light;
  
  // Configuração do cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
  doc.text(title, 14, 15);
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, 14, 25);
  }

  // Configuração da tabela
  const tableData = data.map(item => 
    columns.map(col => {
      const value = item[col.accessor];
      return col.formatter ? col.formatter(value) : value;
    })
  );

  const headers = columns.map(col => col.header);

  // Adiciona a tabela
  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: subtitle ? 35 : 25,
    theme: 'grid',
    headStyles: { 
      fillColor: theme.header,
      textColor: theme.headerText,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: theme.text
    },
    bodyStyles: {
      textColor: isDarkMode ? theme.text : [0, 0, 0]
    },
    headRowStyle: {
      minCellHeight: 10
    },
    alternateRowStyles: {
      fillColor: theme.alternateRow
    }
  });

  // Adiciona data e hora da geração
  const now = new Date();
  doc.setFontSize(8);
  doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
  doc.text(
    `Gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`,
    14,
    (doc as any).lastAutoTable.finalY + 10
  );

  return doc;
}

export function generateLoansReport(loans: LoanWithDetails[], isDarkMode = false) {
  return generatePDF({
    title: 'Relatório de Empréstimos',
    subtitle: `Período: ${new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
    data: loans,
    isDarkMode,
    columns: [
      { header: 'Título do Livro', accessor: 'bookTitle' },
      { header: 'Usuário', accessor: 'userName' },
      { 
        header: 'Data do Empréstimo', 
        accessor: 'borrowDate',
        formatter: (value) => new Date(value).toLocaleDateString('pt-BR')
      },
      { 
        header: 'Data de Devolução', 
        accessor: 'dueDate',
        formatter: (value) => new Date(value).toLocaleDateString('pt-BR')
      },
      { 
        header: 'Status', 
        accessor: 'status',
        formatter: (value) => {
          const today = new Date();
          const dueDate = new Date(value);
          return value === 'active' && dueDate < today ? 'Atrasado' : 
                 value === 'active' ? 'Em Andamento' : 'Devolvido';
        }
      }
    ]
  });
}

export function generateBlockedUsersReport(users: User[], isDarkMode = false) {
  return generatePDF({
    title: 'Relatório de Usuários Bloqueados',
    subtitle: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
    data: users,
    isDarkMode,
    columns: [
      { header: 'Nome', accessor: 'name' },
      { header: 'E-mail', accessor: 'email' },
      { 
        header: 'Função', 
        accessor: 'role',
        formatter: (value) => {
          const roleMap = {
            student: 'Aluno',
            teacher: 'Professor',
            librarian: 'Bibliotecário',
            admin: 'Administrador'
          };
          return roleMap[value as keyof typeof roleMap] || value;
        }
      },
      { 
        header: 'Bloqueado Até', 
        accessor: 'blockedUntil',
        formatter: (value) => new Date(value).toLocaleDateString('pt-BR')
      },
      { header: 'Motivo', accessor: 'blockReason' }
    ]
  });
}

export function generateInventoryReport(books: any[], isDarkMode = false) {
  return generatePDF({
    title: 'Relatório de Inventário',
    subtitle: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
    data: books,
    isDarkMode,
    columns: [
      { header: 'Título', accessor: 'title' },
      { header: 'Autor', accessor: 'author' },
      { header: 'ISBN', accessor: 'isbn' },
      { header: 'Categoria', accessor: 'category' },
      { header: 'Quantidade', accessor: 'quantity' },
      { header: 'Disponíveis', accessor: 'available' }
    ]
  });
} 