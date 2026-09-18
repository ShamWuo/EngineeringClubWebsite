import React from 'react';
import Link from 'next/link';
import { Button, cn } from '@/components/ui/button';
import { ArrowRight, Trophy, Users } from 'lucide-react';

export function HeroCopy({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto h-full pt-4 sm:pt-8 pb-14 sm:pb-24 pointer-events-none select-none',
        className
      )}
    >
      {/* Copy container with smooth upward scroll drift and fade */}
      <div className="hero-copy-drift space-y-4 sm:space-y-6 flex flex-col items-center max-w-3xl">
        {/* Headline */}
        <div
          className="animate-rise pointer-events-auto px-1 w-full"
          style={
            {
              '--rise': '14px',
              animationDelay: '0ms',
              animationDuration: '600ms',
            } as React.CSSProperties
          }
        >
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.16] flex flex-col items-center"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)' }}
          >
            <span className="block">Where Fairview Knights</span>
            <span
              className="block text-amber-100"
              style={{ filter: 'drop-shadow(0 0 18px rgba(220,60,40,0.75)) drop-shadow(0 2px 6px rgba(0,0,0,0.9))' }}
            >
              Build What&apos;s Next.
            </span>
          </h1>
        </div>

        {/* Subhead */}
        <div
          className="animate-rise pointer-events-auto max-w-xl px-2"
          style={
            {
              '--rise': '12px',
              animationDelay: '80ms',
              animationDuration: '600ms',
            } as React.CSSProperties
          }
        >
          <p
            className="text-sm sm:text-base text-white mx-auto leading-relaxed font-semibold"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,1), 0 2px 16px rgba(0,0,0,1), 0 0 32px rgba(0,0,0,0.9)' }}
          >
            The engineering hub for FHS students. Propose hardware grants, squad up with FHS engineers, compete in robotics tournaments, and turn ideas into real prototypes.
          </p>
        </div>

        {/* Action CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto animate-rise pointer-events-auto"
          style={
            {
              '--rise': '10px',
              animationDelay: '160ms',
              animationDuration: '600ms',
            } as React.CSSProperties
          }
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-bold bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-950/40 text-sm px-6 h-10 sm:h-11 transition-all hover:scale-[1.02]">
              <span>Sign In with Google</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#teams" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-semibold text-sm bg-black/60 hover:bg-black/75 text-white border-white/30 hover:border-white/50 backdrop-blur-md h-10 sm:h-11 px-5 shadow-lg transition-all hover:scale-[1.02]">
              <Users className="h-4 w-4 text-red-400" />
              <span>Explore Teams</span>
            </Button>
          </a>
          <Link href="/competitions" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-1.5 font-semibold text-sm bg-black/50 hover:bg-black/65 text-white hover:text-white border-white/25 h-10 sm:h-11 px-5 backdrop-blur-sm shadow-md transition-all hover:scale-[1.02]">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Competitions</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
