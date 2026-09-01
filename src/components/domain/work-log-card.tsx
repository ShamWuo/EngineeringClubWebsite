'use client';

import React, { useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteWorkLog } from '@/actions/logs';
import { Clock, AlertTriangle, Trash2, Globe, Lock } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type WorkLogRow = Database['public']['Tables']['work_logs']['Row'];

interface WorkLogCardProps {
  log: WorkLogRow;
  authorName?: string | null;
  authorEmail?: string;
  authorAvatar?: string | null;
  teamName?: string | null;
  compName?: string | null;
  currentUserId?: string;
  isOfficer?: boolean;
}

export function WorkLogCard({
  log,
  authorName,
  authorEmail,
  authorAvatar,
  teamName,
  compName,
  currentUserId,
  isOfficer = false,
}: WorkLogCardProps) {
  const [isPending, startTransition] = useTransition();

  const isAuthor = currentUserId === log.author_id;
  const canDelete = isAuthor || isOfficer;

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this work log entry?')) return;
    startTransition(async () => {
      await deleteWorkLog({ log_id: log.id });
    });
  };

  const formattedDate = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });

  return (
    <Card className="shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName || 'Avatar'}
                className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold text-xs border border-red-200 dark:border-red-900">
                {(authorName || authorEmail || 'U').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {authorName || authorEmail || 'Member'}
                </span>
                {teamName && (
                  <Badge variant="outline" className="text-2xs font-normal py-0">
                    {teamName}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {log.hours_spent && (
              <div className="flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                <Clock className="h-3 w-3" />
                <span>{log.hours_spent} hrs</span>
              </div>
            )}
            {log.visibility === 'club' ? (
              <span title="Visible to entire club" className="text-zinc-400 dark:text-zinc-500">
                <Globe className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span title="Visible to team and officers" className="text-zinc-400 dark:text-zinc-500">
                <Lock className="h-3.5 w-3.5" />
              </span>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-0">
        <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
          {log.body}
        </div>

        {log.blockers && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold">Blockers: </span>
              {log.blockers}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
