'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, type Theme } from './theme-provider';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { cn } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'segmented';
}

export function ThemeToggle({ className, variant = 'button' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'segmented') {
    return (
      <div className={cn('inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700', className)}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
            theme === 'light'
              ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          )}
          title="Light Mode"
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
            theme === 'dark'
              ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          )}
          title="Dark Mode"
        >
          <Moon className="h-3.5 w-3.5 text-red-500" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
            theme === 'system'
              ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          )}
          title="System Preference"
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95',
          className
        )}
        aria-label={`Switch theme (currently ${theme})`}
        title={`Current theme: ${theme}. Click to change.`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 text-red-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-3xs font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            Theme Mode
          </div>

          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              theme === 'light'
                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <div className="flex items-center gap-2">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check className="h-3.5 w-3.5 text-red-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              theme === 'dark'
                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <div className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 text-red-400" />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check className="h-3.5 w-3.5 text-red-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              theme === 'system'
                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <div className="flex items-center gap-2">
              <Laptop className="h-3.5 w-3.5 text-zinc-400" />
              <span>System</span>
            </div>
            {theme === 'system' && <Check className="h-3.5 w-3.5 text-red-600" />}
          </button>
        </div>
      )}
    </div>
  );
}
