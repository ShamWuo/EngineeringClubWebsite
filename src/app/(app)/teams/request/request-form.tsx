'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { submitTeamRequest } from '@/actions/teams';
import { Send, Users } from 'lucide-react';
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

  const handleMemberToggle = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((m) => m !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await submitTeamRequest({
        competition_id: competitionId,
        proposed_name: proposedName.trim(),
        purpose: purpose.trim(),
        proposed_member_ids: selectedMemberIds,
        needs_funding: needsFunding,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        router.push('/dashboard');
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
              Proposed Team Name *
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
              Team Mission, Objectives & Deliverables *
            </label>
            <Textarea
              required
              rows={4}
              placeholder="Detail what technical modules your team will design, manufacture, and test..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Proposed Initial Members (Optional)
            </label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 p-2.5 space-y-1.5 bg-zinc-50 dark:bg-zinc-900/40">
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(m.id)}
                    onChange={() => handleMemberToggle(m.id)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-red-600 focus:ring-red-500 bg-white dark:bg-zinc-900"
                  />
                  <span>
                    <strong className="font-semibold">{m.full_name || m.email}</strong> ({m.email})
                  </span>
                </label>
              ))}
            </div>
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
            disabled={isPending || !proposedName.trim() || !purpose.trim()}
            className="font-semibold gap-1.5"
          >
            <Send className="h-4 w-4" />
            {isPending ? 'Submitting...' : 'Submit Team Proposal'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
