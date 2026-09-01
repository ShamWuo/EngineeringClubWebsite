import * as React from 'react';
import { cn } from './button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-100 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-100 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-100 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
