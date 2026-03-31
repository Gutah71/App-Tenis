import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, ApiError } from '../lib/api';
import type { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'PLAYER' | 'ORGANIZER') => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string }) => Promise<void>;
  isPlayer: boolean;
  isOrganizer: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'tennis_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    loading: true,
  });

  // On mount, if we have a stored token, validate it by fetching /auth/me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState({ user: null, token: null, loading: false });
      return;
    }

    api.get<{ user: User }>('/auth/me', token)
      .then(({ user }) => {
        setState({ user, token, loading: false });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, loading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, loading: false });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: 'PLAYER' | 'ORGANIZER') => {
    const { user, token } = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false });
  }, []);

  const updateUser = useCallback(async (data: { name?: string }) => {
    const { user } = await api.patch<{ user: User }>('/users/profile', data, state.token!);
    setState((prev) => ({ ...prev, user }));
  }, [state.token]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    isPlayer: state.user?.role === 'PLAYER',
    isOrganizer: state.user?.role === 'ORGANIZER',
    isGuest: state.user === null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

export { ApiError };
