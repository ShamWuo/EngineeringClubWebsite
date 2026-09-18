'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { createTeam } from '@/actions/teams';
import { MemberSearchMultiSelect } from '@/components/domain/member-search-multi-select';
import { Users, Plus } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type CompRow = Database['public']['Tables']['competitions']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function TeamRequestForm({
  competitions,
  members,
  prefilledCompId,
}: {
  competitions: CompRow[];
  members: ProfileRow[];
  prefilledCompId?: string;
}) {
  const router = useRouter();
  const [competitionId, setCompetitionId] = useState(
    prefilledCompId || competitions[0]?.id || ''
  );
  const [proposedName, setProposedName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [needsFunding, setNeedsFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!proposedName.trim()) {
      setError('Team name is required.');
      return;
    }

    startTransition(async () => {
      const res = await createTeam({
        competition_id: competitionId,
        name: proposedName.trim(),
        description: purpose.trim(),
        member_ids: selectedMemberIds,
        needs_funding: needsFunding,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        router.push(`/teams/${res.data.team.id}`);
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Target Competition *
            </label>
            <Select
              required
              value={competitionId}
              onChange={(e) => setCompetitionId(e.target.value)}
            >
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.season || 'Current'})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Team Name *
            </label>
            <Input
              required
              placeholder="e.g. FHS Knights Aero Subsystem / Titan Rover Drivetrain"
              value={proposedName}
              onChange={(e) => setProposedName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Team Mission, Objectives & Deliverables
            </label>
            <Textarea
              rows={4}
              placeholder="Detail what technical modules your team will design, manufacture, and test..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div>
            <MemberSearchMultiSelect
              availableMembers={members}
              selectedMemberIds={selectedMemberIds}
              onSelectionChange={setSelectedMemberIds}
              label="Add Team Members"
              helperText="Search registered club members by name or email. Added members will join your team roster."
              placeholder="Type to search members by name, email, or discipline..."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="needs_funding"
              checked={needsFunding}
              onChange={(e) => setNeedsFunding(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-red-600 focus:ring-red-500 bg-white dark:bg-zinc-900"
            />
            <label htmlFor="needs_funding" className="text-xs text-zinc-700 dark:text-zinc-300 select-none cursor-pointer">
              This team will require dedicated club procurement / funding allocation.
            </label>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
          <Link href="/competitions">
            <Button type="button" variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending || !proposedName.trim()}
            className="font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {isPending ? 'Creating Team...' : 'Create Team'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
