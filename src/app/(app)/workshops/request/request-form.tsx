'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { submitWorkshopRequest } from '@/actions/workshops';
import { Send, Sparkles } from 'lucide-react';

export function WorkshopRequestForm() {
  const [topic, setTopic] = useState('');
  const [rationale, setRationale] = useState('');
  const [offeringToTeach, setOfferingToTeach] = useState(false);
  const [timeframe, setTimeframe] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await submitWorkshopRequest({
        topic: topic.trim(),
        rationale: rationale.trim(),
        offering_to_teach: offeringToTeach,
        preferred_timeframe: timeframe.trim() || null,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setTopic('');
        setRationale('');
        setTimeframe('');
        setOfferingToTeach(false);
        setSuccess(true);
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-3.5">
          {error && (
            <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Workshop proposal posted to the community board!
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workshop Topic *
            </label>
            <Input
              required
              placeholder="e.g. Embedded Rust / ANSYS FEA Simulation"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Why Is This Valuable to Club Members? *
            </label>
            <Textarea
              required
              rows={3}
              placeholder="Explain how this skill helps active subteams or general career engineering growth..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Timeframe (Optional)
            </label>
            <Input
              placeholder="e.g. Midterms week evening, or Saturday morning"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="offering_to_teach"
              checked={offeringToTeach}
              onChange={(e) => setOfferingToTeach(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="offering_to_teach" className="text-xs text-slate-700 dark:text-slate-300 select-none">
              I am offering to instruct/lead this workshop myself.
            </label>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !topic.trim() || !rationale.trim()}
            className="font-semibold gap-1.5 text-xs"
          >
            <Send className="h-3.5 w-3.5" />
            {isPending ? 'Submitting...' : 'Post Topic Proposal'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
