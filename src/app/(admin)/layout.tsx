import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { getNotifications, getOfficerReviewQueue, getLinks, getClubSettings } from '@/lib/db/queries';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Returns 404 for non-admins (prevents route leakage)
  const user = await requireRole(['admin']);

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
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <AppSidebar
        currentUser={user}
        notifications={notifications}
        clubName={settings.club_name}
        userRole={user.role}
        pendingReviewCount={reviewData.counts.total}
        primaryLinks={primaryLinks}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto w-full">
        <div className="max-w-6xl w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
