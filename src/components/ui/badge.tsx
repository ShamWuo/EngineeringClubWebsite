import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './button';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-600 text-white',
        secondary: 'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
        destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
        outline: 'text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300',
        warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300',
        info: 'border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300',
        purple: 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300',
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
