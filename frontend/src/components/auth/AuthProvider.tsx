import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types';

const AuthContext = createContext<{
  auth: AuthState;
  login: (token: string, role: 'customer' | 'admin', extra?: Record<string, string>) => void;
  logout: () => void;
}>({
  auth: { token: null, sessionId: null, storeId: null, tableId: null, role: null, isAuthenticated: false },
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as AuthState['role'];
    return {
      token,
      sessionId: localStorage.getItem('sessionId'),
      storeId: localStorage.getItem('storeId'),
      tableId: localStorage.getItem('tableId'),
      role,
      isAuthenticated: !!token,
    };
  });

  const login = (token: string, role: 'customer' | 'admin', extra?: Record<string, string>) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (extra) Object.entries(extra).forEach(([k, v]) => localStorage.setItem(k, v));
    setAuth({
      token, role, isAuthenticated: true,
      sessionId: extra?.sessionId || null,
      storeId: extra?.storeId || null,
      tableId: extra?.tableId || null,
    });
  };

  const logout = () => {
    ['token', 'role', 'sessionId', 'storeId', 'tableId'].forEach(k => localStorage.removeItem(k));
    setAuth({ token: null, sessionId: null, storeId: null, tableId: null, role: null, isAuthenticated: false });
  };

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
}
