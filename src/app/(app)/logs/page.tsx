import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { WorkLogComposer } from '@/components/domain/work-log-composer';
import { WorkLogCard } from '@/components/domain/work-log-card';
import { EmptyState } from '@/components/domain/empty-state';
import { PenTool, Clock, Users, Globe, Lock } from 'lucide-react';

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const db = getDb();
  const params = await searchParams;
  const activeTab = params.tab || 'mine';

  const myTeamMemberships = db.team_members.filter((m) => m.user_id === user.id);
  const myTeamIds = myTeamMemberships.map((m) => m.team_id);
  const myTeams = myTeamMemberships
    .map((m) => db.teams.find((t) => t.id === m.team_id))
    .filter(Boolean) as { id: string; name: string }[];

  const isOfficer = user.role === 'officer' || user.role === 'admin';

  let filteredLogs = db.work_logs;

  if (activeTab === 'mine') {
    filteredLogs = filteredLogs.filter((l) => l.author_id === user.id);
  } else if (activeTab === 'teams') {
    filteredLogs = filteredLogs.filter(
      (l) => l.team_id && myTeamIds.includes(l.team_id)
    );
  } else if (activeTab === 'club') {
    filteredLogs = filteredLogs.filter(
      (l) => l.visibility === 'club' || isOfficer || (l.team_id && myTeamIds.includes(l.team_id)) || l.author_id === user.id
    );
  }

  // Calculate my total hours logged
  const myTotalHours = db.work_logs
    .filter((l) => l.author_id === user.id)
    .reduce((sum, l) => sum + (l.hours_spent || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <PenTool className="h-6 w-6 text-purple-600" />
            Engineering Work Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep team members, leads, and officers updated on your technical progress, testing data, and blockers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-3.5 py-1.5 rounded-xl">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <div className="text-xs font-bold text-purple-900 dark:text-purple-200">
            {myTotalHours.toFixed(1)} hrs logged
          </div>
        </div>
      </div>

      {/* Interactive Log Composer */}
      <WorkLogComposer teams={myTeams} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { id: 'mine', label: 'My Logs', icon: PenTool },
          { id: 'teams', label: 'My Teams', icon: Users },
          { id: 'club', label: 'Club-wide Feed', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`/logs?tab=${tab.id}`}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Work Logs Feed */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Log Entries in this View"
            description="Post your first engineering update using the form above."
          />
        ) : (
          filteredLogs.map((log) => {
            const author = db.profiles.find((p) => p.id === log.author_id);
            const team = db.teams.find((t) => t.id === log.team_id);
            const comp = db.competitions.find((c) => c.id === log.competition_id);

            return (
              <WorkLogCard
                key={log.id}
                log={log}
                authorName={author?.full_name || null}
                authorEmail={author?.email}
                authorAvatar={author?.avatar_url}
                teamName={team?.name}
                compName={comp?.name}
                currentUserId={user.id}
                isOfficer={isOfficer}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
