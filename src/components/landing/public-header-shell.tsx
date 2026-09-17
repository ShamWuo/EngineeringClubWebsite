'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/components/ui/button';

export function PublicHeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const run = () => {
      rafId = 0;
      setScrolled(window.scrollY > 40);
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(run);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    schedule();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-xs'
          : 'border-b border-zinc-200/30 dark:border-zinc-800/30 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md'
      )}
    >
      {children}
    </header>
  );
}
