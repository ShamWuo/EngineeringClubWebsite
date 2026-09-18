import React from 'react';
import { requireUser } from '@/lib/auth/require-role';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { getDb } from '@/lib/db/mock-data';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
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
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <AppSidebar
        currentUser={user}
        notifications={userNotifications}
        clubName={db.club_settings.club_name}
        userRole={user.role}
        pendingReviewCount={pendingReviewCount}
        primaryLinks={primaryLinks}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto w-full">
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
