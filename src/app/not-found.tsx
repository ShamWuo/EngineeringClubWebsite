import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md">
        The requested resource, competition, team, or route does not exist or you do not have permission to view it.
      </p>
      <div className="pt-2">
        <Link href="/dashboard">
          <Button size="sm" className="gap-1.5 font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
