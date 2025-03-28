// Tipos de usuário
export type UserRole = 'admin' | 'librarian' | 'teacher' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  borrow_limit: number;
  borrow_duration: number;
  blocked_until: Date | null;
  block_reason: string | null;
  active_loans: number;
  created_at: Date;
  updated_at: Date;
}

// Tipos de livro
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publication_year: number;
  edition: string | null;
  category_id: number;
  description: string | null;
  cover_url: string | null;
  total_copies: number;
  available_copies: number;
  location: string;
  created_at: Date;
  updated_at: Date;
}

// Tipos de empréstimo
export type LoanStatus = 'active' | 'returned' | 'overdue' | 'lost';

export interface Loan {
  id: number;
  user_id: number;
  book_id: number;
  loan_date: Date;
  due_date: Date;
  return_date: Date | null;
  status: LoanStatus;
  fine_amount: number | null;
  fine_paid: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// Tipos de reserva
export type ReservationStatus = 'active' | 'cancelled' | 'completed';

export interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  reservation_date: Date;
  expiration_date: Date;
  status: ReservationStatus;
  created_at: Date;
  updated_at: Date;
}

// Tipos de notificação
export type NotificationType = 'due_date' | 'overdue' | 'reservation' | 'fine' | 'system';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tipos de configuração
export interface Setting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

// Tipos de log de atividade
export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  description: string;
  ip_address: string | null;
  created_at: Date;
} 