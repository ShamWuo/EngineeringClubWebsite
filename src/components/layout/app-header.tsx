'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PersonaSwitcher } from './persona-switcher';
import { NotificationBell } from './notification-bell';
import { StatusBadge } from '@/components/domain/status-badge';
import { Menu, X, Cpu } from 'lucide-react';
import type { AuthUser } from '@/lib/supabase/server';
import type { Database } from '@/lib/db/types';

interface AppHeaderProps {
  currentUser: AuthUser;
  notifications: Database['public']['Tables']['notifications']['Row'][];
  clubName?: string;
}

export function AppHeader({ currentUser, notifications, clubName }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-sm group-hover:scale-105 transition-transform">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {clubName || 'Engineering Club'}
            </span>
            <span className="text-2xs text-slate-500 dark:text-slate-400">Members Portal</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <PersonaSwitcher currentUser={currentUser} />

        <NotificationBell notifications={notifications} />

        <Link
          href="/me"
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity"
        >
          {currentUser.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name || 'User'}
              className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-xs">
              {(currentUser.full_name || currentUser.email || 'U').substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {currentUser.full_name || currentUser.email}
            </span>
            <StatusBadge status={currentUser.role} className="text-3xs py-0 px-1.5" />
          </div>
        </Link>
      </div>
    </header>
  );
}
