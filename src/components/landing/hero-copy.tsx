import React from 'react';
import Link from 'next/link';
import { Button, cn } from '@/components/ui/button';
import { ArrowRight, Cpu, Trophy, Users } from 'lucide-react';

export function HeroCopy({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto h-full pt-4 sm:pt-8 pb-14 sm:pb-24 pointer-events-none select-none',
        className
      )}
    >
      {/* Copy container */}
      <div className="space-y-3 sm:space-y-5 flex flex-col items-center max-w-3xl">
        {/* Kicker Badge */}
        <div
          className="animate-rise pointer-events-auto"
          style={
            {
              '--rise': '10px',
              animationDelay: '0ms',
              animationDuration: '500ms',
            } as React.CSSProperties
          }
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 backdrop-blur-md px-3 sm:px-4 py-1 text-2xs font-mono font-bold uppercase tracking-widest text-zinc-100 shadow-lg">
            <Cpu className="h-3 w-3 text-red-400" />
            Fairview HS Engineering · Room 604
          </span>
        </div>

        {/* Headline */}
        <div
          className="animate-rise pointer-events-auto px-1 w-full"
          style={
            {
              '--rise': '14px',
              animationDelay: '60ms',
              animationDuration: '600ms',
            } as React.CSSProperties
          }
        >
          <h1 className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.18] drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] flex flex-col items-center">
            <span className="block">Where Fairview Knights</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-amber-200 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
              Build What&apos;s Next.
            </span>
          </h1>
        </div>

        {/* Subhead */}
        <div
          className="animate-rise pointer-events-auto max-w-2xl px-2"
          style={
            {
              '--rise': '12px',
              animationDelay: '120ms',
              animationDuration: '600ms',
            } as React.CSSProperties
          }
        >
          <p className="text-xs sm:text-base text-zinc-100/95 mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
            The central engineering platform for Fairview High School. Propose hardware grants, join competitive robotics squads, upskill with technical masterclasses, and manufacture real prototypes in Room 604.
          </p>
        </div>

        {/* Action CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto animate-rise pointer-events-auto"
          style={
            {
              '--rise': '10px',
              animationDelay: '180ms',
              animationDuration: '600ms',
            } as React.CSSProperties
          }
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-bold bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-950/40 text-xs px-5 h-9 sm:h-10 transition-all hover:scale-[1.02]">
              <span>Sign In with School Account</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#teams" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-semibold text-xs bg-black/55 hover:bg-black/75 text-white border-white/25 hover:border-white/40 backdrop-blur-md h-9 sm:h-10 px-5 shadow-lg transition-all hover:scale-[1.02]">
              <Users className="h-4 w-4 text-red-400" />
              <span>Explore Teams</span>
            </Button>
          </a>
          <Link href="/competitions" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-1.5 font-semibold text-xs bg-black/40 hover:bg-black/60 text-zinc-200 hover:text-white border-white/20 h-9 sm:h-10 px-4 backdrop-blur-sm shadow-md transition-all hover:scale-[1.02]">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Competitions</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
