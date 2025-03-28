
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'librarian' | 'teacher' | 'student';
  borrowLimit: number;
  borrowDuration: number;
  blockedUntil: string | null;
  blockReason?: string;
  activeLoans: number;
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: number, user: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  getUser: (id: number) => User | undefined;
  searchUsers: (query: string) => User[];
  blockUser: (id: number, days: number, reason: string) => Promise<void>;
  unblockUser: (id: number) => Promise<void>;
}

// Mock data - This would be replaced by actual API calls
const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@school.edu',
    role: 'student',
    borrowLimit: 3,
    borrowDuration: 7,
    blockedUntil: null,
    activeLoans: 1,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    role: 'student',
    borrowLimit: 3,
    borrowDuration: 7,
    blockedUntil: '2023-12-20',
    blockReason: 'Late return of 2 books',
    activeLoans: 3,
  },
  {
    id: 3,
    name: 'Dr. Robert Williams',
    email: 'r.williams@school.edu',
    role: 'teacher',
    borrowLimit: 5,
    borrowDuration: 30,
    blockedUntil: null,
    activeLoans: 2,
  },
  {
    id: 4,
    name: 'Lisa Chen',
    email: 'l.chen@school.edu',
    role: 'librarian',
    borrowLimit: 0,
    borrowDuration: 0,
    blockedUntil: null,
    activeLoans: 0,
  },
];

// Create context
const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Provider component
export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUsers(mockUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Add a new user
  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...user,
        id: Date.now(), // Generate a unique ID
      };
      
      setUsers(prev => [...prev, newUser]);
      toast({
        title: 'User added',
        description: `${user.name} has been added successfully.`,
      });
    } catch (err) {
      console.error('Error adding user:', err);
      toast({
        title: 'Failed to add user',
        description: 'An error occurred while adding the user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update a user
  const updateUser = async (id: number, userUpdate: Partial<User>) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? { ...user, ...userUpdate } : user
        )
      );
      
      toast({
        title: 'User updated',
        description: 'The user information has been updated successfully.',
      });
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: 'Failed to update user',
        description: 'An error occurred while updating the user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.filter(user => user.id !== id));
      
      toast({
        title: 'User deleted',
        description: 'The user has been removed from the system.',
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Failed to delete user',
        description: 'An error occurred while deleting the user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get a user by ID
  const getUser = (id: number) => {
    return users.find(user => user.id === id);
  };

  // Search users
  const searchUsers = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return users;
    
    return users.filter(
      user =>
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.role.toLowerCase().includes(normalizedQuery)
    );
  };

  // Block a user
  const blockUser = async (id: number, days: number, reason: string) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const blockDate = new Date();
      blockDate.setDate(blockDate.getDate() + days);
      
      setUsers(prev => 
        prev.map(user => 
          user.id === id 
            ? { 
                ...user, 
                blockedUntil: blockDate.toISOString().split('T')[0],
                blockReason: reason
              } 
            : user
        )
      );
      
      toast({
        title: 'User blocked',
        description: `The user has been blocked for ${days} days.`,
      });
    } catch (err) {
      console.error('Error blocking user:', err);
      toast({
        title: 'Failed to block user',
        description: 'An error occurred while blocking the user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Unblock a user
  const unblockUser = async (id: number) => {
    try {
      setLoading(true);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => 
        prev.map(user => 
          user.id === id 
            ? { 
                ...user, 
                blockedUntil: null,
                blockReason: undefined
              } 
            : user
        )
      );
      
      toast({
        title: 'User unblocked',
        description: 'The user has been unblocked successfully.',
      });
    } catch (err) {
      console.error('Error unblocking user:', err);
      toast({
        title: 'Failed to unblock user',
        description: 'An error occurred while unblocking the user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        addUser,
        updateUser,
        deleteUser,
        getUser,
        searchUsers,
        blockUser,
        unblockUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

// Custom hook to use users context
export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
