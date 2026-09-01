'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'fhs_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Synchronize the DOM element class and resolved theme state
  const applyTheme = (targetTheme: Theme) => {
    const root = document.documentElement;
    let isDark = false;

    if (targetTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = targetTheme === 'dark';
    }

    if (isDark) {
      root.classList.add('dark');
      setResolvedTheme('dark');
    } else {
      root.classList.remove('dark');
      setResolvedTheme('light');
    }
  };

  useEffect(() => {
    // 1. Check local storage
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme: Theme =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';

    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    // 2. Listen to system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentStored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (!currentStored || currentStored === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setResolvedTheme('dark');
        } else {
          document.documentElement.classList.remove('dark');
          setResolvedTheme('light');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
