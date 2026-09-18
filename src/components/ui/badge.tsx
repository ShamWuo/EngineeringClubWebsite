import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './button';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-red-600 text-white',
        secondary: 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200',
        destructive: 'border-red-200 dark:border-red-900 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200',
        outline: 'border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900',
        success: 'border-emerald-200 dark:border-emerald-900 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200',
        warning: 'border-amber-200 dark:border-amber-900 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200',
        info: 'border-sky-200 dark:border-sky-900 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200',
        purple: 'border-purple-200 dark:border-purple-900 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200',
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
