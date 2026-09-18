import React from 'react';
import Link from 'next/link';
import { Button, cn } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Cpu, Trophy, Users } from 'lucide-react';

export function HeroCopy({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative z-20 flex flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto h-full pt-[5svh] sm:pt-[8svh] pb-0 pointer-events-none select-none',
        'before:absolute before:inset-0 before:-z-10 before:pointer-events-none',
        'before:[background:radial-gradient(ellipse_at_center,var(--sky-top)_30%,transparent_72%)]',
        'before:opacity-80',
        className
      )}
    >
      {/* Copy rides its own parallax channel — sinks + softens like a near-field
          object as the page scrolls. Var driven; neutral without JS. */}
      <div
        className="hero-copy-drift space-y-5 sm:space-y-6 flex flex-col items-center"
        style={
          {
            '--copy-drift': '0px',
            willChange: 'transform',
          } as React.CSSProperties
        }
      >
        {/* Kicker */}
        <div
          className="animate-rise pointer-events-auto"
          style={
            {
              '--rise': '18px',
              animationDelay: '250ms',
              animationDuration: '900ms',
            } as React.CSSProperties
          }
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300/80 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm px-3 py-1 text-2xs font-mono font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300 shadow-xs">
            <Cpu className="h-3 w-3 text-red-600 dark:text-red-400" />
            Fairview HS Engineering · Room 604
          </span>
        </div>

        {/* Headline */}
        <div
          className="animate-rise pointer-events-auto max-w-3xl hero-glow-text"
          style={
            {
              '--rise': '26px',
              animationDelay: '400ms',
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
        </div>

        {/* Subhead */}
        <div
          className="animate-rise pointer-events-auto max-w-2xl hero-glow-text"
          style={
            {
              '--rise': '22px',
              animationDelay: '520ms',
              animationDuration: '1000ms',
            } as React.CSSProperties
          }
        >
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mx-auto leading-relaxed">
            The central engineering platform for Fairview High School. Propose hardware grants, join competitive robotics squads, upskill with technical masterclasses, and manufacture real prototypes in Room 604.
          </p>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto animate-rise pointer-events-auto"
          style={
            {
              '--rise': '22px',
              animationDelay: '640ms',
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
          <a href="#teams" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-semibold text-xs bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 h-10 px-5">
              <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Explore Teams</span>
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

      {/* Scroll cue — gentle bob, anchors to the teams section */}
      <a
        href="#teams"
        aria-label="Scroll to explore"
        className="animate-rise pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full border border-zinc-300/70 dark:border-zinc-700/70 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400/60 transition-colors"
        style={
          {
            '--rise': '14px',
            animationDelay: '1250ms',
            animationDuration: '900ms',
          } as React.CSSProperties
        }
      >
        <ChevronDown className="h-4 w-4 ridge-bob" />
      </a>
    </div>
  );
}
