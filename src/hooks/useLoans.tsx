import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBooks } from '@/hooks/useBooks';
import { useUsers } from '@/hooks/useUsers';

// Types
export interface Loan {
  id: number;
  bookId: number;
  userId: number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'returned' | 'overdue';
  renewalCount: number;
}

export interface LoanWithDetails extends Loan {
  bookTitle: string;
  userName: string;
  userRole: string;
}

interface LoansContextType {
  loans: LoanWithDetails[];
  loading: boolean;
  error: string | null;
  borrowBook: (bookId: number, userId: number) => Promise<void>;
  returnBook: (loanId: number) => Promise<void>;
  getUserActiveLoans: (userId: number) => LoanWithDetails[];
  getBookLoans: (bookId: number) => LoanWithDetails[];
  getOverdueLoans: () => LoanWithDetails[];
  getLoan: (id: number) => LoanWithDetails | undefined;
}

// Mock data - This would be replaced by actual API calls
const mockLoans: Loan[] = [
  {
    id: 1,
    bookId: 1,
    userId: 1,
    borrowDate: '2023-12-01',
    dueDate: '2023-12-08',
    returnDate: null,
    status: 'active',
    renewalCount: 0,
  },
  {
    id: 2,
    bookId: 2,
    userId: 3,
    borrowDate: '2023-11-15',
    dueDate: '2023-12-15',
    returnDate: null,
    status: 'active',
    renewalCount: 0,
  },
  {
    id: 3,
    bookId: 4,
    userId: 2,
    borrowDate: '2023-11-20',
    dueDate: '2023-11-27',
    returnDate: null,
    status: 'overdue',
    renewalCount: 0,
  },
  {
    id: 4,
    bookId: 3,
    userId: 3,
    borrowDate: '2023-10-05',
    dueDate: '2023-11-05',
    returnDate: '2023-11-01',
    status: 'returned',
    renewalCount: 0,
  },
];

// Create context
const LoansContext = createContext<LoansContextType | undefined>(undefined);

// Provider component
export function LoansProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { books, updateBook } = useBooks();
  const { users, updateUser, blockUser } = useUsers();

  // Load initial data and enrich with details
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Enrich loans with book and user details
        const enrichedLoans: LoanWithDetails[] = mockLoans.map(loan => {
          const book = books.find(b => b.id === loan.bookId);
          const user = users.find(u => u.id === loan.userId);
          
          return {
            ...loan,
            bookTitle: book?.title || 'Unknown Book',
            userName: user?.name || 'Unknown User',
            userRole: user?.role || 'unknown',
          };
        });
        
        setLoans(enrichedLoans);
        setError(null);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Failed to load loans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (books.length > 0 && users.length > 0) {
      fetchLoans();
    }
  }, [books, users]);

  // Borrow a book
  const borrowBook = async (bookId: number, userId: number) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const book = books.find(b => b.id === bookId);
      const user = users.find(u => u.id === userId);
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if book is available
      if (book.availableCopies <= 0) {
        throw new Error(`No copies of "${book.title}" are available`);
      }
      
      // Check if user is blocked
      if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
        throw new Error(`User is blocked until ${user.blockedUntil}`);
      }
      
      // Check if user has reached borrowing limit
      const userActiveLoans = mockLoans.filter(
        l => l.userId === userId && l.status === 'active'
      ).length;
      
      if (userActiveLoans >= user.borrowLimit) {
        throw new Error(`User has reached the borrowing limit of ${user.borrowLimit} books`);
      }
      
      // Calculate due date based on user role
      const borrowDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + user.borrowDuration);
      
      // Create new loan
      const newLoan: Loan = {
        id: Date.now(),
        bookId,
        userId,
        borrowDate: borrowDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        returnDate: null,
        status: 'active',
        renewalCount: 0,
      };
      
      // Update book available copies
      await updateBook(bookId, {
        availableCopies: book.availableCopies - 1,
        status: book.availableCopies - 1 <= 0 ? 'borrowed' : book.status,
      });
      
      // Add the loan
      const enrichedLoan: LoanWithDetails = {
        ...newLoan,
        bookTitle: book.title,
        userName: user.name,
        userRole: user.role,
      };
      
      setLoans(prev => [...prev, enrichedLoan]);
      
      // Update user's active loans count
      await updateUser(userId, {
        activeLoans: user.activeLoans + 1,
      });
      
      toast({
        title: 'Book borrowed',
        description: `"${book.title}" has been borrowed successfully. Due date: ${dueDate.toLocaleDateString()}`,
      });
    } catch (err) {
      console.error('Error borrowing book:', err);
      toast({
        title: 'Failed to borrow book',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Return a book
  const returnBook = async (loanId: number) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const loan = loans.find(l => l.id === loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      if (loan.status === 'returned') {
        throw new Error('This book has already been returned');
      }
      
      const book = books.find(b => b.id === loan.bookId);
      const user = users.find(u => u.id === loan.userId);
      
      if (!book || !user) {
        throw new Error('Book or user not found');
      }
      
      const returnDate = new Date();
      const dueDate = new Date(loan.dueDate);
      
      // Check if return is late
      const isLate = returnDate > dueDate;
      
      // Update loan
      setLoans(prev => 
        prev.map(l => 
          l.id === loanId
            ? {
                ...l,
                returnDate: returnDate.toISOString().split('T')[0],
                status: 'returned',
              }
            : l
        )
      );
      
      // Update book available copies
      await updateBook(loan.bookId, {
        availableCopies: book.availableCopies + 1,
        status: book.availableCopies + 1 > 0 ? 'available' : book.status,
      });
      
      // Update user's active loans count
      await updateUser(loan.userId, {
        activeLoans: Math.max(0, user.activeLoans - 1),
      });
      
      // Apply late return penalty if needed
      if (isLate) {
        const daysDiff = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let blockDays = 0;
        if (daysDiff <= 3) {
          blockDays = 3;
        } else {
          blockDays = 7;
        }
        
        await blockUser(
          loan.userId,
          blockDays,
          `Late return by ${daysDiff} day${daysDiff === 1 ? '' : 's'}`
        );
        
        toast({
          title: 'Book returned late',
          description: `The book was returned ${daysDiff} day${daysDiff === 1 ? '' : 's'} late. User has been blocked for ${blockDays} days.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Book returned',
          description: 'The book has been returned successfully.',
        });
      }
    } catch (err) {
      console.error('Error returning book:', err);
      toast({
        title: 'Failed to return book',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all active loans for a user
  const getUserActiveLoans = (userId: number) => {
    return loans.filter(loan => loan.userId === userId && loan.status !== 'returned');
  };

  // Get all loans for a book
  const getBookLoans = (bookId: number) => {
    return loans.filter(loan => loan.bookId === bookId);
  };

  // Get all overdue loans
  const getOverdueLoans = () => {
    const today = new Date().toISOString().split('T')[0];
    return loans.filter(loan => 
      loan.status === 'active' && loan.dueDate < today
    );
  };

  // Get a loan by ID
  const getLoan = (id: number) => {
    return loans.find(loan => loan.id === id);
  };

  return (
    <LoansContext.Provider
      value={{
        loans,
        loading,
        error,
        borrowBook,
        returnBook,
        getUserActiveLoans,
        getBookLoans,
        getOverdueLoans,
        getLoan,
      }}
    >
      {children}
    </LoansContext.Provider>
  );
}

// Custom hook to use loans context
export function useLoans() {
  const context = useContext(LoansContext);
  if (context === undefined) {
    throw new Error('useLoans must be used within a LoansProvider');
  }
  return context;
}
