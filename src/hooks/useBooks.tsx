
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Types
export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  status: 'available' | 'borrowed' | 'reserved';
  coverImage?: string;
}

interface BooksContextType {
  books: Book[];
  loading: boolean;
  error: string | null;
  addBook: (book: Omit<Book, 'id'>) => Promise<void>;
  updateBook: (id: number, book: Partial<Book>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  getBook: (id: number) => Book | undefined;
  searchBooks: (query: string) => Book[];
}

// Mock data - This would be replaced by actual API calls
const mockBooks: Book[] = [
  {
    id: 1,
    isbn: '9780061122415',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    totalCopies: 5,
    availableCopies: 3,
    location: 'Section A, Shelf 2',
    status: 'available',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg',
  },
  {
    id: 2,
    isbn: '9780679783268',
    title: '1984',
    author: 'George Orwell',
    genre: 'Science Fiction',
    totalCopies: 3,
    availableCopies: 1,
    location: 'Section B, Shelf 3',
    status: 'borrowed',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg',
  },
  {
    id: 3,
    isbn: '9780143127550',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    totalCopies: 4,
    availableCopies: 4,
    location: 'Section A, Shelf 1',
    status: 'available',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg',
  },
  {
    id: 4,
    isbn: '9780062073501',
    title: 'Murder on the Orient Express',
    author: 'Agatha Christie',
    genre: 'Mystery',
    totalCopies: 2,
    availableCopies: 0,
    location: 'Section C, Shelf 2',
    status: 'borrowed',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1486131451i/853510.jpg',
  },
  {
    id: 5,
    isbn: '9780156012195',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Children',
    totalCopies: 3,
    availableCopies: 2,
    location: 'Section D, Shelf 1',
    status: 'available',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1367545443i/157993.jpg',
  },
];

// Create context
const BooksContext = createContext<BooksContextType | undefined>(undefined);

// Provider component
export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBooks(mockBooks);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Add a new book
  const addBook = async (book: Omit<Book, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBook: Book = {
        ...book,
        id: Date.now(), // Generate a unique ID
      };
      
      setBooks(prev => [...prev, newBook]);
      toast({
        title: 'Book added',
        description: `"${book.title}" has been added to the catalog.`,
      });
    } catch (err) {
      console.error('Error adding book:', err);
      toast({
        title: 'Failed to add book',
        description: 'An error occurred while adding the book.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update a book
  const updateBook = async (id: number, bookUpdate: Partial<Book>) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBooks(prev => 
        prev.map(book => 
          book.id === id ? { ...book, ...bookUpdate } : book
        )
      );
      
      toast({
        title: 'Book updated',
        description: 'The book information has been updated successfully.',
      });
    } catch (err) {
      console.error('Error updating book:', err);
      toast({
        title: 'Failed to update book',
        description: 'An error occurred while updating the book.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a book
  const deleteBook = async (id: number) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBooks(prev => prev.filter(book => book.id !== id));
      
      toast({
        title: 'Book deleted',
        description: 'The book has been removed from the catalog.',
      });
    } catch (err) {
      console.error('Error deleting book:', err);
      toast({
        title: 'Failed to delete book',
        description: 'An error occurred while deleting the book.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get a book by ID
  const getBook = (id: number) => {
    return books.find(book => book.id === id);
  };

  // Search books
  const searchBooks = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return books;
    
    return books.filter(
      book =>
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery) ||
        book.isbn.includes(normalizedQuery) ||
        book.genre.toLowerCase().includes(normalizedQuery)
    );
  };

  return (
    <BooksContext.Provider
      value={{
        books,
        loading,
        error,
        addBook,
        updateBook,
        deleteBook,
        getBook,
        searchBooks,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

// Custom hook to use books context
export function useBooks() {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
}
