'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import apiClient from '@/lib/api-client';
import { User } from '@/lib/permissions';

interface AuthContextType {
  user: User | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('access_token');
      if (token) {
        try {
          const { data } = await apiClient.get('/auth/me');
          setUser(data);
        } catch (_error) {
          Cookies.remove('access_token', { path: '/' });
          Cookies.remove('refresh_token', { path: '/' });
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (loginData: any) => {
    const { data } = await apiClient.post('/auth/login', loginData);
    Cookies.set('access_token', data.accessToken, { secure: true, sameSite: 'strict' });
    Cookies.set('refresh_token', data.refreshToken, { secure: true, sameSite: 'strict' });
    setUser(data.user);
  };

  const logout = () => {
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    setUser(null);
    globalThis.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
