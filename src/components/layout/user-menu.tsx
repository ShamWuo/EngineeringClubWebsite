'use client';

import React, { useTransition } from 'react';

import { signOut } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';
import type { AuthUser } from '@/lib/supabase/server';

interface UserMenuProps {
  currentUser: AuthUser;
}

export function UserMenu({ currentUser }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();


  const handleSignOut = () => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Client signout error:', e);
      }
      await signOut({});
      window.location.href = '/login';
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      title="Sign out"
      className="group flex items-center gap-1.5 h-7 w-7 hover:w-auto px-0 hover:px-2 overflow-hidden rounded-md text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer justify-center"
    >
      <LogOut className="h-3.5 w-3.5 shrink-0" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-[5rem] transition-all duration-200 text-xs font-semibold whitespace-nowrap">
        {isPending ? 'Signing out…' : 'Sign Out'}
      </span>
    </button>
  );
}

