import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storeApi } from '../../services/api';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{ theme: Theme; storeName: string; setTheme: (t: Theme) => void; loadStoreInfo: (slug: string) => void }>({
  theme: 'dark', storeName: '', setTheme: () => {}, loadStoreInfo: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const darkVars: Record<string, string> = {
  '--bg-primary': '#0a0a0c', '--bg-secondary': '#111114', '--bg-card': 'rgba(255,255,255,0.06)', '--bg-header': 'rgba(255,255,255,0.04)',
  '--bg-input': 'rgba(255,255,255,0.08)', '--border': 'rgba(255,255,255,0.1)', '--border-input': 'rgba(255,255,255,0.15)',
  '--text-primary': 'rgba(255,255,255,0.95)', '--text-secondary': 'rgba(255,255,255,0.7)', '--text-muted': 'rgba(255,255,255,0.4)', '--text-dim': 'rgba(255,255,255,0.25)',
  '--accent': '#0a84ff', '--accent-hover': '#409cff',
  '--btn-secondary': 'rgba(255,255,255,0.1)', '--btn-secondary-text': 'rgba(255,255,255,0.7)',
  '--scrollbar-track': 'rgba(255,255,255,0.03)', '--scrollbar-thumb': 'rgba(255,255,255,0.15)',
  '--glass-bg': 'rgba(255,255,255,0.06)', '--glass-border': 'rgba(255,255,255,0.12)',
  '--glass-shadow': '0 8px 32px rgba(0,0,0,0.4)', '--glass-blur': 'blur(40px) saturate(180%)',
  '--glass-highlight': 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%)',
  '--nav-bg': 'rgba(20,20,24,0.72)',
};

const lightVars: Record<string, string> = {
  '--bg-primary': '#f2f2f7', '--bg-secondary': '#ffffff', '--bg-card': 'rgba(255,255,255,0.6)', '--bg-header': 'rgba(255,255,255,0.6)',
  '--bg-input': 'rgba(120,120,128,0.08)', '--border': 'rgba(0,0,0,0.06)', '--border-input': 'rgba(0,0,0,0.1)',
  '--text-primary': 'rgba(0,0,0,0.88)', '--text-secondary': 'rgba(0,0,0,0.6)', '--text-muted': 'rgba(0,0,0,0.35)', '--text-dim': 'rgba(0,0,0,0.2)',
  '--accent': '#007aff', '--accent-hover': '#0056cc',
  '--btn-secondary': 'rgba(0,0,0,0.05)', '--btn-secondary-text': 'rgba(0,0,0,0.6)',
  '--scrollbar-track': 'rgba(0,0,0,0.03)', '--scrollbar-thumb': 'rgba(0,0,0,0.15)',
  '--glass-bg': 'rgba(255,255,255,0.55)', '--glass-border': 'rgba(255,255,255,0.7)',
  '--glass-shadow': '0 8px 32px rgba(0,0,0,0.08)', '--glass-highlight': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)',
  '--nav-bg': 'rgba(249,249,249,0.72)',
};

function applyVars(vars: Record<string, string>) {
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [storeName, setStoreName] = useState('');

  const applyTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyVars(t === 'dark' ? darkVars : lightVars);
  }, []);

  const loadStoreInfo = useCallback((slug: string) => {
    storeApi.getTheme(slug).then(res => {
      applyTheme(res.theme as Theme);
      setStoreName(res.name);
    }).catch(() => {});
  }, [applyTheme]);

  useEffect(() => { applyVars(darkVars); }, []);

  return <ThemeContext.Provider value={{ theme, storeName, setTheme: applyTheme, loadStoreInfo }}>{children}</ThemeContext.Provider>;
}
