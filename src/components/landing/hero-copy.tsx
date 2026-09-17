import React from 'react';
import Link from 'next/link';
import { Button, cn } from '@/components/ui/button';
import { ArrowRight, Trophy, Users } from 'lucide-react';

export function HeroCopy({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative z-20 flex flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto h-full pt-[5svh] sm:pt-[7svh] pb-0 pointer-events-none select-none',
        className
      )}
    >
      <div className="space-y-5 sm:space-y-6 flex flex-col items-center">
        {/* Live Season Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/85 dark:bg-zinc-900/85 border border-zinc-200/80 dark:border-zinc-800 shadow-xs backdrop-blur-md transition-all animate-rise pointer-events-auto"
          style={
            {
              '--rise': '24px',
              animationDelay: '400ms',
              animationDuration: '900ms',
            } as React.CSSProperties
          }
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Fairview High School • Innovation & Robotics
          </span>
          <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/90 dark:text-red-400 border border-red-200 dark:border-red-900/60">
            2026-27
          </span>
        </div>

        {/* Headline & Subhead */}
        <div
          className="space-y-4 animate-rise pointer-events-auto max-w-3xl"
          style={
            {
              '--rise': '24px',
              animationDelay: '500ms',
              animationDuration: '1000ms',
            } as React.CSSProperties
          }
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            Where Fairview Knights <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-400 dark:via-red-500 dark:to-rose-400">
              Build What&apos;s Next.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            The central engineering platform for Fairview High School. Propose hardware grants, join competitive robotics squads, upskill with technical masterclasses, and manufacture real prototypes in Room 604.
          </p>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto animate-rise pointer-events-auto"
          style={
            {
              '--rise': '24px',
              animationDelay: '600ms',
              animationDuration: '1100ms',
            } as React.CSSProperties
          }
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/20 text-xs px-5 h-10 transition-all hover:scale-[1.02]">
              <span>Sign In with School Account</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#subteams" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-semibold text-xs backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 h-10 px-5">
              <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Explore Subteams</span>
            </Button>
          </a>
          <Link href="/competitions" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto gap-1.5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white h-10 px-4">
              <Trophy className="h-4 w-4 text-zinc-400" />
              <span>Competitions</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
