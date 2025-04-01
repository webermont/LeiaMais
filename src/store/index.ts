import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { themes, ThemeName } from '@/config/themes';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'gray',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

interface NotificationState {
  unreadCount: number;
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    read: boolean;
  }>;
  setUnreadCount: (count: number) => void;
  addNotification: (notification: { title: string; message: string }) => void;
  markAsRead: (id: number) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: Date.now(), read: false },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
})); 