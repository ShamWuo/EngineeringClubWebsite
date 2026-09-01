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
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-4">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
      {children}
    </div>
  );
}
