'use client';

import React from 'react';
import Link from 'next/link';
import { UserMenu } from './user-menu';
import { NotificationBell } from './notification-bell';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { StatusBadge } from '@/components/domain/status-badge';
import { Cpu } from 'lucide-react';
import type { AuthUser } from '@/lib/supabase/server';
import type { Database } from '@/lib/db/types';

interface AppHeaderProps {
  currentUser: AuthUser;
  notifications: Database['public']['Tables']['notifications']['Row'][];
  clubName?: string;
}

export function AppHeader({ currentUser, notifications, clubName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-black/90 backdrop-blur-md px-4 sm:px-6 transition-colors">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-md shadow-red-950/40 border border-red-500 group-hover:scale-105 transition-transform">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm leading-tight text-white group-hover:text-red-400 transition-colors">
              {clubName || 'Fairview High School Engineering'}
            </span>
            <span className="text-3xs text-zinc-400 font-mono uppercase tracking-wider">
              Members Portal
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} />

        <ThemeToggle />

        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-800">
          {currentUser.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name || 'User'}
              className="h-8 w-8 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs shadow-xs">
              {(currentUser.full_name || currentUser.email || 'U').substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs font-semibold text-zinc-200 leading-tight">
              {currentUser.full_name || currentUser.email}
            </span>
            <StatusBadge status={currentUser.role} className="text-3xs py-0 px-1.5 mt-0.5" />
          </div>

          <UserMenu currentUser={currentUser} />
        </div>
      </div>
    </header>
  );
}
