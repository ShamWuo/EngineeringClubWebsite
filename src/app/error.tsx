'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Something went wrong
      </h2>
      <p className="text-xs text-slate-500 max-w-sm">
        {error.message || 'An unexpected application error occurred while rendering this view.'}
      </p>
      <Button onClick={() => reset()} size="sm" className="gap-1.5 font-semibold">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
