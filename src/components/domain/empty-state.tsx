import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 my-4 transition-colors">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 mb-4">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
      {children}
    </div>
  );
}
