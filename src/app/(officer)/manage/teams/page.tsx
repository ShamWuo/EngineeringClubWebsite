import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RosterTable } from '@/components/domain/roster-table';
import { Users, Trophy } from 'lucide-react';

export default async function ManageTeamsPage() {
  const user = await requireRole(['officer', 'admin']);
  const db = getDb();

  const teams = db.teams;
  const competitions = db.competitions;
  const profiles = db.profiles;
  const teamMembers = db.team_members;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Users className="h-6 w-6 text-brand-600" />
          Manage Team Rosters & Leads
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review subteam rosters, assign Team Leads (enforced 1 lead per team), and add or remove members.
        </p>
      </div>

      <div className="space-y-6">
        {teams.map((team) => {
          const comp = competitions.find((c) => c.id === team.competition_id);
          const members = teamMembers
            .filter((tm) => tm.team_id === team.id)
            .map((tm) => {
              const prof = profiles.find((p) => p.id === tm.user_id);
              return {
                user_id: tm.user_id,
                role: tm.role,
                joined_at: tm.joined_at,
                full_name: prof?.full_name || null,
                email: prof?.email || 'Unknown',
                avatar_url: prof?.avatar_url || null,
                skills: prof?.skills || [],
              };
            });

          return (
            <Card key={team.id} className="p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 px-2 py-0.5 rounded">
                      {comp?.name || 'Competition'}
                    </span>
                    <span className="text-xs text-slate-400">({members.length} members)</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {team.name}
                  </h2>
                </div>
              </div>

              <RosterTable
                teamId={team.id}
                members={members}
                canManage={true}
                currentUserId={user.id}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
