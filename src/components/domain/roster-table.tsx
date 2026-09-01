'use client';

import React, { useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateTeamRoster } from '@/actions/teams';
import { Crown, UserMinus, ShieldAlert } from 'lucide-react';
import type { Database, TeamRole } from '@/lib/db/types';

interface MemberInfo {
  user_id: string;
  role: TeamRole;
  joined_at: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  skills: string[];
}

interface RosterTableProps {
  teamId: string;
  members: MemberInfo[];
  canManage: boolean;
  currentUserId: string;
}

export function RosterTable({ teamId, members, canManage, currentUserId }: RosterTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleSetLead = (userId: string) => {
    if (!confirm('Make this member the Team Lead?')) return;
    startTransition(async () => {
      await updateTeamRoster({
        team_id: teamId,
        user_id: userId,
        role: 'lead',
        action: 'set_lead',
      });
    });
  };

  const handleRemove = (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this team?`)) return;
    startTransition(async () => {
      await updateTeamRoster({
        team_id: teamId,
        user_id: userId,
        role: 'member',
        action: 'remove',
      });
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Member</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4 hidden md:table-cell">Skills</th>
            <th className="py-3 px-4 hidden sm:table-cell">Joined</th>
            {canManage && <th className="py-3 px-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
          {members.map((m) => {
            const isLead = m.role === 'lead';

            return (
              <tr key={m.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.full_name || 'Member'}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs">
                        {(m.full_name || m.email || 'U').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{m.full_name || m.email}</span>
                        {m.user_id === currentUserId && (
                          <span className="text-2xs text-brand-600 font-normal">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{m.email}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  {isLead ? (
                    <Badge variant="purple" className="gap-1 py-0.5">
                      <Crown className="h-3 w-3" />
                      Team Lead
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="py-0.5">
                      Member
                    </Badge>
                  )}
                </td>

                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {m.skills && m.skills.length > 0 ? (
                      m.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="inline-block text-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">No skills listed</span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4 hidden sm:table-cell text-xs text-slate-500">
                  {new Date(m.joined_at).toLocaleDateString()}
                </td>

                {canManage && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isLead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetLead(m.user_id)}
                          disabled={isPending}
                          className="h-7 text-xs gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                          title="Assign as Lead"
                        >
                          <Crown className="h-3 w-3" />
                          <span className="hidden lg:inline">Make Lead</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(m.user_id, m.full_name || m.email)}
                        disabled={isPending}
                        className="h-7 text-xs gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Remove Member"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">Remove</span>
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
