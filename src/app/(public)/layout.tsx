import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Cpu, ArrowRight, User, Shield, MapPin, Clock, ExternalLink } from 'lucide-react';
import { getClubSettings } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/supabase/server';
import { PublicHeaderShell } from '@/components/landing/public-header-shell';
import { PublicNav } from '@/components/landing/public-nav';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [clubSettings, user] = await Promise.all([
    getClubSettings(),
    getCurrentUser(),
  ]);
  const clubName = clubSettings.club_name || 'Fairview High School Engineering Club';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Public Header with dynamic scroll transparency and full navigation */}
      <PublicHeaderShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-bold shadow-md shadow-red-950/30 border border-red-500/80 group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight">
                {clubName}
              </span>
              <span className="text-3xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Boulder, CO • BVSD
              </span>
            </div>
          </Link>

          {/* Desktop Links & Mobile Menu */}
          <PublicNav />

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="gap-1.5 font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-950/20"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Portal</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="gap-1 font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-950/20"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </PublicHeaderShell>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive 4-Column Engineering Club Footer */}
      <footer className="border-t border-zinc-200/90 dark:border-zinc-800/90 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-md transition-colors text-xs text-zinc-600 dark:text-zinc-400 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Club Brand & Affiliation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white font-bold text-xs shadow-xs">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="font-black text-sm text-zinc-900 dark:text-white">
                  FHS Knights Engineering
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Empowering students at Fairview High School with hardware grants, competitive robotics, and hands-on prototyping.
              </p>
              <div className="flex items-center gap-2 text-2xs font-mono text-zinc-500">
                <MapPin className="h-3.5 w-3.5 text-red-600 dark:text-red-500 shrink-0" />
                <span>Fairview High School • Boulder Valley School District</span>
              </div>
            </div>

            {/* Col 2: Competitions & Subteams */}
            <div className="space-y-2.5">
              <div className="text-2xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest font-mono">
                Squads & Challenges
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/competitions" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    Active Competitions
                  </Link>
                </li>
                <li>
                  <a href="#subteams" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    Robotics & Race Subteams
                  </a>
                </li>
                <li>
                  <Link href="/requests/new?type=competition" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    Propose New Competition
                  </Link>
                </li>
                <li>
                  <Link href="/links" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    Design Repos & Cloud CAD
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Workshops & Requests */}
            <div className="space-y-2.5">
              <div className="text-2xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest font-mono">
                Prototyping & Grants
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/workshops" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    Upcoming Workshops & Syllabus
                  </Link>
                </li>
                <li>
                  <Link href="/requests/new" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    Equipment & Funding Requests
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    How We Build (Grant Workflow)
                  </a>
                </li>
                <li>
                  <a href="#makerspace" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    Lab Machinery & 3D Printers
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Meeting Times & Access */}
            <div className="space-y-2.5">
              <div className="text-2xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest font-mono">
                Lab Schedule & Safety
              </div>
              <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Tuesdays & Thursdays</span>
                    <div>3:45 PM – 5:30 PM (Room 604 & Shop)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-2xs text-zinc-500 pt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Lab Status: Active 2026-27 Season</span>
                </div>
                <div className="pt-1">
                  <Link href="/login" className="text-red-600 dark:text-red-400 font-semibold hover:underline inline-flex items-center gap-1">
                    <span>Member Authentication</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-zinc-500 dark:text-zinc-500">
            <p>© {new Date().getFullYear()} {clubName}. Fairview High School (BVSD). All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://www.bvsd.org" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                BVSD District Portal
              </a>
              <span>•</span>
              <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                Club FAQ
              </a>
              <span>•</span>
              <span className="font-mono">v2.1 Precision</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
