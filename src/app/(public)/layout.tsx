import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Cpu, ArrowRight } from 'lucide-react';
import { getClubSettings } from '@/lib/db/queries';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const clubSettings = await getClubSettings();
  const clubName = clubSettings.club_name || 'Fairview High School Engineering Club';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Public Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold shadow-md shadow-red-950/40 border border-red-500 group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="font-black text-sm sm:text-base text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {clubName}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hidden sm:inline transition-colors"
            >
              Members Dashboard
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button
                size="sm"
                className="gap-1 font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-950/40"
              >
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
      <footer className="border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-black py-8 text-center text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {clubName}. Fairview High School (BVSD).</p>
          <p className="mt-1 text-3xs text-zinc-400 dark:text-zinc-600">Built with Next.js App Router & Supabase</p>
        </div>
      </footer>
    </div>
  );
}
