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
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-red-500" />
          Manage Team Rosters & Leads
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review subteam rosters, assign Team Leads (enforced 1 lead per team), and add or remove members.
        </p>
      </div>

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
            <Card key={team.id} className="p-5 bg-zinc-950 border-zinc-850">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xs font-semibold bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                      {comp?.name || 'Competition'}
                    </span>
                    <span className="text-xs text-zinc-500">({members.length} members)</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
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
