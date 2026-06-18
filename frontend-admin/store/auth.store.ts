import { create } from 'zustand';
import { User } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initializeAuth: () => boolean;
}

const tokenCookieOptions = {
  expires: 7,
  path: '/',
  sameSite: 'lax' as const,
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  
  login: (token: string, user: User) => {
    Cookies.set('token', token, tokenCookieOptions);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },
  
  logout: () => {
    Cookies.remove('token', { path: '/' });
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
  },
  
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  initializeAuth: () => {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = Cookies.get('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      Cookies.remove('token', { path: '/' });
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
      return false;
    }

    try {
      const user = JSON.parse(userStr) as User;

      if (user.role !== 'admin') {
        Cookies.remove('token', { path: '/' });
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
        return false;
      }

      set({ token, user, isAuthenticated: true, isInitialized: true });
      return true;
    } catch {
      Cookies.remove('token', { path: '/' });
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
      return false;
    }
  },
}));
