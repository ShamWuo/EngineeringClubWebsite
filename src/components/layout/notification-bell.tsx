'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markNotificationRead, markAllNotificationsRead } from '@/actions/auth';
import type { Database } from '@/lib/db/types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export function NotificationBell({ notifications }: { notifications: NotificationRow[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const unreadNotifications = notifications.filter((n) => !n.read_at);
  const unreadCount = unreadNotifications.length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead({});
    });
  };

  const handleNotificationClick = (id: string) => {
    startTransition(async () => {
      await markNotificationRead({ notificationId: id });
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between p-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-2xs bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-1.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="h-6 text-2xs gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => {
                  const isUnread = !n.read_at;
                  return (
                    <div
                      key={n.id}
                      className={`p-3 text-left transition-colors ${
                        isUnread
                          ? 'bg-red-50/40 dark:bg-red-950/20'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {n.title}
                        </span>
                        <span className="text-3xs text-zinc-400 shrink-0">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {n.body && (
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-normal">
                          {n.body}
                        </p>
                      )}
                      {n.href && (
                        <Link
                          href={n.href}
                          onClick={() => handleNotificationClick(n.id)}
                          className="mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
