'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Input, Select } from '@/components/ui/input';
import { createWorkLog } from '@/actions/logs';
import { PenTool, Send, Clock, AlertCircle } from 'lucide-react';

interface TeamOption {
  id: string;
  name: string;
}

export function WorkLogComposer({
  teams = [],
  defaultTeamId,
}: {
  teams?: TeamOption[];
  defaultTeamId?: string;
}) {
  const [body, setBody] = useState('');
  const [teamId, setTeamId] = useState(defaultTeamId || (teams[0]?.id ?? ''));
  const [hours, setHours] = useState('');
  const [blockers, setBlockers] = useState('');
  const [visibility, setVisibility] = useState<'team' | 'club'>('team');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await createWorkLog({
        body: body.trim(),
        team_id: teamId || null,
        hours_spent: hours ? parseFloat(hours) : null,
        blockers: blockers.trim() || null,
        visibility,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setBody('');
        setHours('');
        setBlockers('');
      }
    });
  };

  return (
    <Card className="border-brand-200/80 dark:border-brand-900/60 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <PenTool className="h-4 w-4 text-brand-600" />
          Log What You're Working On
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2 text-xs rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <Textarea
            required
            rows={3}
            placeholder="Today I machined the gearbox mounting bracket and calibrated the rotary encoder..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="text-sm"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {teams.length > 0 && (
              <div>
                <label className="block text-2xs font-medium text-slate-500 mb-1">Team</label>
                <Select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="h-8 text-xs"
                >
                  <option value="">No Team / General</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="block text-2xs font-medium text-slate-500 mb-1">
                Hours Spent
              </label>
              <Input
                type="number"
                step="0.5"
                min="0.1"
                placeholder="e.g. 3.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-slate-500 mb-1">
                Visibility
              </label>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'team' | 'club')}
                className="h-8 text-xs"
              >
                <option value="team">Team & Officers Only</option>
                <option value="club">Public to Whole Club</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">
              Blockers / Bottlenecks (Optional)
            </label>
            <Input
              placeholder="e.g. Waiting on lathe tooling replacement bit"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !body.trim()}
              className="gap-1.5 text-xs font-semibold"
            >
              <Send className="h-3.5 w-3.5" />
              {isPending ? 'Posting...' : 'Post Log Entry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
