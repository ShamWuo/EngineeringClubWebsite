'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { LineItemBuilder, type LineItem } from '@/components/domain/line-item-builder';
import { submitFundingRequest } from '@/actions/funding';
import { Send, Upload, FileText } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type TeamRow = Database['public']['Tables']['teams']['Row'];
type CompRow = Database['public']['Tables']['competitions']['Row'];

export function FundingNewForm({
  teams,
  competitions,
}: {
  teams: TeamRow[];
  competitions: CompRow[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [competitionId, setCompetitionId] = useState(competitions[0]?.id || '');
  const [justification, setJustification] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      vendor: '',
      unit_cost_cents: 0,
      quantity: 1,
      url: '',
    },
  ]);
  const [receiptFilename, setReceiptFilename] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFilename(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate line items
    const invalidItems = lineItems.some(
      (item) => !item.description.trim() || item.unit_cost_cents <= 0 || item.quantity < 1
    );
    if (invalidItems) {
      setError('Please provide a valid description and cost greater than $0 for all line items.');
      return;
    }

    startTransition(async () => {
      const res = await submitFundingRequest({
        title: title.trim(),
        team_id: teamId || null,
        competition_id: competitionId || null,
        justification: justification.trim(),
        line_items: lineItems.map((item) => ({
          description: item.description.trim(),
          vendor: item.vendor.trim() || null,
          unit_cost_cents: item.unit_cost_cents,
          quantity: item.quantity,
          url: item.url.trim() || null,
        })),
        receipt_filename: receiptFilename || undefined,
        receipt_storage_path: receiptFilename ? `receipts/${receiptFilename}` : undefined,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        router.push('/funding');
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Procurement Request Title *
            </label>
            <Input
              required
              placeholder="e.g. Battery Management System ICs & High-Voltage Contactors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Subteam (Optional)
              </label>
              <Select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                <option value="">No Team / General Project</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Competition (Optional)
              </label>
              <Select value={competitionId} onChange={(e) => setCompetitionId(e.target.value)}>
                <option value="">No Competition</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Justification & Engineering Impact *
            </label>
            <Textarea
              required
              rows={3}
              placeholder="Explain why these items are required for technical compliance, testing, or competition readiness..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

          {/* Dynamic Line Items Builder */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <LineItemBuilder items={lineItems} onChange={setLineItems} />
          </div>

          {/* Receipt / Official Quote Upload */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vendor Quote / Receipt Attachment (PDF or Image)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload PDF/Image</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {receiptFilename ? (
                <span className="text-xs text-brand-600 font-medium flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> {receiptFilename}
                </span>
              ) : (
                <span className="text-xs text-slate-400">No file chosen (optional)</span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <Link href="/funding">
            <Button type="button" variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending || !title.trim() || !justification.trim()}
            className="font-semibold gap-1.5"
          >
            <Send className="h-4 w-4" />
            {isPending ? 'Submitting...' : 'Submit Funding Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
