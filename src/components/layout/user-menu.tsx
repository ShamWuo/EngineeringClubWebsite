'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import type { AuthUser } from '@/lib/supabase/server';

interface UserMenuProps {
  currentUser: AuthUser;
}

export function UserMenu({ currentUser }: UserMenuProps) {
  const router = useRouter();
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
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={isPending}
        className="h-8 px-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5 transition-colors cursor-pointer"
        title="Sign out of account"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{isPending ? 'Signing out...' : 'Sign Out'}</span>
      </Button>
    </div>
  );
}
