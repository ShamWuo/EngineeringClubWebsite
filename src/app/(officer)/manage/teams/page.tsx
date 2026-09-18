import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getTeams, getCompetitions, getAdminProfiles } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { RosterTable } from '@/components/domain/roster-table';
import { Users } from 'lucide-react';

export default async function ManageTeamsPage() {
  const user = await requireRole(['officer', 'admin']);
  const supabase = await createClient();

  const [teams, competitions, profiles, { data: teamMembers }] = await Promise.all([
    getTeams(),
    getCompetitions(),
    getAdminProfiles(),
    supabase.from('team_members').select('*'),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const compMap = new Map(competitions.map((c) => [c.id, c]));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-red-600 dark:text-red-500" />
          Manage Team Rosters & Leads
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Review team rosters, assign Team Leads (enforced 1 lead per team), and add or remove members.
        </p>
      </div>

      {teams.length === 0 ? (
        <Card className="p-10 text-center bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800">
          <Users className="h-8 w-8 text-zinc-400 mx-auto mb-3 opacity-60" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">No Teams Created</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            No squads or teams exist yet. Once team requests are approved or squads are pitched, they will appear here for roster management.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => {
            const comp = team.competition_id ? compMap.get(team.competition_id) : null;
            const members = ((teamMembers as any[]) || [])
              .filter((tm: any) => tm.team_id === team.id)
              .map((tm: any) => {
                const prof = profileMap.get(tm.user_id);
                return {
                  user_id: tm.user_id,
                  role: tm.role,
                  joined_at: tm.joined_at,
                  full_name: prof?.full_name || null,
                  email: prof?.email || 'FHS Student',
                  avatar_url: prof?.avatar_url || null,
                  skills: prof?.skills || [],
                };
              });

            return (
              <Card key={team.id} className="p-5 bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-3xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 px-2 py-0.5 rounded">
                        {comp?.name || 'Competition'}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">({members.length} members)</span>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
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
      )}
    </div>
  );
}
