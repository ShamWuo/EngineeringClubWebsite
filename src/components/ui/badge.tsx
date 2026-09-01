import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './button';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-red-600 text-white',
        secondary: 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
        destructive: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300',
        outline: 'border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-transparent',
        success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
        warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300',
        info: 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300',
        purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
