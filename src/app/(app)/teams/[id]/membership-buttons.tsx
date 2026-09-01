'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { joinTeam, leaveTeam, toggleTeamRecruiting } from '@/actions/teams';
import { UserPlus, UserMinus, UserCheck, Check, Radio } from 'lucide-react';

export function TeamMembershipButtons({
  teamId,
  isMember,
  isLead,
  isRecruiting,
}: {
  teamId: string;
  isMember: boolean;
  isLead: boolean;
  isRecruiting: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      await joinTeam({ team_id: teamId });
    });
  };

  const handleLeave = () => {
    if (!confirm('Leave this team? You will lose access to team-private work logs.')) return;
    startTransition(async () => {
      await leaveTeam({ team_id: teamId });
    });
  };

  const handleToggleRecruiting = () => {
    startTransition(async () => {
      await toggleTeamRecruiting({ team_id: teamId, is_recruiting: !isRecruiting });
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isLead && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleRecruiting}
          disabled={isPending}
          className="text-xs font-semibold gap-1.5"
        >
          <Radio className={`h-3 w-3 ${isRecruiting ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span>{isRecruiting ? 'Close Recruiting' : 'Open Recruiting'}</span>
        </Button>
      )}

      {isMember ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleLeave}
          disabled={isPending}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900 gap-1.5"
        >
          <UserMinus className="h-3.5 w-3.5" />
          Leave Team
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={handleJoin}
          disabled={isPending || !isRecruiting}
          className="text-xs font-semibold gap-1.5 shadow-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {isRecruiting ? 'Join Team Roster' : 'Roster Closed'}
        </Button>
      )}
    </div>
  );
}
