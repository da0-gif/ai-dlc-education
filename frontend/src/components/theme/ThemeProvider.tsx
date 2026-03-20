import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storeApi } from '../../services/api';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void; loadStoreTheme: (slug: string) => void }>({
  theme: 'dark', setTheme: () => {}, loadStoreTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const darkVars: Record<string, string> = {
  '--bg-primary': '#1a1a1a', '--bg-secondary': '#222', '--bg-card': '#2a2a2a', '--bg-header': '#111',
  '--bg-input': '#333', '--border': '#333', '--border-input': '#555',
  '--text-primary': '#fff', '--text-secondary': '#ccc', '--text-muted': '#888', '--text-dim': '#666',
  '--accent': '#e53935', '--accent-hover': '#c62828',
  '--btn-secondary': '#444', '--btn-secondary-text': '#ccc',
  '--scrollbar-track': '#222', '--scrollbar-thumb': '#555',
};

const lightVars: Record<string, string> = {
  '--bg-primary': '#f5f5f5', '--bg-secondary': '#fff', '--bg-card': '#fff', '--bg-header': '#fff',
  '--bg-input': '#f0f0f0', '--border': '#e0e0e0', '--border-input': '#ccc',
  '--text-primary': '#212121', '--text-secondary': '#424242', '--text-muted': '#757575', '--text-dim': '#9e9e9e',
  '--accent': '#d32f2f', '--accent-hover': '#b71c1c',
  '--btn-secondary': '#e0e0e0', '--btn-secondary-text': '#424242',
  '--scrollbar-track': '#f0f0f0', '--scrollbar-thumb': '#bbb',
};

function applyVars(vars: Record<string, string>) {
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  const applyTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyVars(t === 'dark' ? darkVars : lightVars);
  }, []);

  const loadStoreTheme = useCallback((slug: string) => {
    storeApi.getTheme(slug).then(res => applyTheme(res.theme as Theme)).catch(() => {});
  }, [applyTheme]);

  useEffect(() => { applyVars(darkVars); }, []);

  return <ThemeContext.Provider value={{ theme, setTheme: applyTheme, loadStoreTheme }}>{children}</ThemeContext.Provider>;
}
