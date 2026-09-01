import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { getNotifications, getOfficerReviewQueue, getLinks, getClubSettings } from '@/lib/db/queries';

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  // Returns 404 for non-officers (prevents route leakage)
  const user = await requireRole(['officer', 'admin']);

  const [notifications, reviewData, links, settings] = await Promise.all([
    getNotifications(user.id),
    getOfficerReviewQueue(),
    getLinks(),
    getClubSettings(),
  ]);

  const primaryLinks = links
    .filter((l) => l.tier === 'primary' && l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <AppHeader
        currentUser={user}
        notifications={notifications}
        clubName={settings.club_name}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <AppSidebar
          userRole={user.role}
          pendingReviewCount={reviewData.counts.total}
          primaryLinks={primaryLinks}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
