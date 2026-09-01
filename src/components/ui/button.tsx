import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-950/20 focus-visible:ring-red-500',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus-visible:ring-red-500',
        outline:
          'border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 focus-visible:ring-red-400',
        secondary:
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600',
        ghost:
          'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white',
        link: 'text-red-600 dark:text-red-400 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
