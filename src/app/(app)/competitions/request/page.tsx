'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { submitCompetitionRequest } from '@/actions/competitions';
import { Trophy, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function CompetitionRequestPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [url, setUrl] = useState('');
  const [why, setWhy] = useState('');
  const [cost, setCost] = useState('');
  const [teamSize, setTeamSize] = useState('6');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await submitCompetitionRequest({
        name: name.trim(),
        organizer: organizer.trim() || null,
        url: url.trim() || null,
        why: why.trim(),
        estimated_cost_cents: cost ? Math.round(parseFloat(cost) * 100) : 0,
        estimated_team_size: teamSize ? parseInt(teamSize, 10) : null,
        deadline: deadline || null,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to competitions
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-brand-600" />
          Propose a New Competition
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Have an exciting engineering challenge you'd like the club to sponsor and enter? Submit a proposal for officer review.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Competition Name *
              </label>
              <Input
                required
                placeholder="e.g. University Rover Challenge / Solar Car Race"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organizing Body
                </label>
                <Input
                  placeholder="e.g. ASME / IEEE / NASA"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Why Should the Club Participate? (Rationale & Value) *
              </label>
              <Textarea
                required
                rows={4}
                placeholder="Explain the engineering challenges, hardware skills acquired, and student learning opportunities..."
                value={why}
                onChange={(e) => setWhy(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Entry Budget ($)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 1500"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Team Size
                </label>
                <Input
                  type="number"
                  min="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Deadline
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Link href="/competitions">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || !why.trim()}
              className="font-semibold gap-1.5"
            >
              <Send className="h-4 w-4" />
              {isPending ? 'Submitting...' : 'Submit Competition Proposal'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
