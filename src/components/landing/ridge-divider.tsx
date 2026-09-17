import React from 'react';
import { cn } from '@/components/ui/button';

export function RidgeDivider({
  className,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        'w-full relative flex items-center justify-center my-8 sm:my-14 pointer-events-none select-none',
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200/90 dark:border-zinc-800/90 [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]" />
      </div>
      <div className="relative flex items-center gap-2 px-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600/80 dark:bg-red-500/80" />
        <span className="h-1 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <span className="h-1.5 w-1.5 rounded-full bg-red-600/80 dark:bg-red-500/80" />
      </div>
    </div>
  );
}
