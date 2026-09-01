import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cpu, ArrowRight } from 'lucide-react';
import { getDb } from '@/lib/db/mock-data';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const db = getDb();
  const clubName = db.club_settings.club_name;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Public Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-slate-100">
              {clubName}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hidden sm:inline">
              Members Dashboard
            </Link>
            <Link href="/login">
              <Button size="sm" className="gap-1 font-semibold">
                Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {clubName}. All rights reserved.</p>
          <p className="mt-1">Powered by Next.js 15 App Router & Supabase</p>
        </div>
      </footer>
    </div>
  );
}
