import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { getDb } from '@/lib/db/mock-data';

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  // Returns 404 for non-officers (prevents route leakage)
  const user = await requireRole(['officer', 'admin']);
  const db = getDb();

  const userNotifications = db.notifications
    .filter((n) => n.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const pendingReviewCount =
    db.team_requests.filter((r) => r.status === 'pending').length +
    db.competition_requests.filter((r) => r.status === 'pending').length +
    db.workshop_requests.filter((r) => r.status === 'pending').length +
    db.funding_requests.filter((r) => r.status === 'pending').length;

  const primaryLinks = db.links
    .filter((l) => l.tier === 'primary' && l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader
        currentUser={user}
        notifications={userNotifications}
        clubName={db.club_settings.club_name}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <AppSidebar
          userRole={user.role}
          pendingReviewCount={pendingReviewCount}
          primaryLinks={primaryLinks}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
