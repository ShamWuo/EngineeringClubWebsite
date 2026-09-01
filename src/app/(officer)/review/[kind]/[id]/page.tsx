import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { ReviewDecisionForm } from './decision-form';
import {
  ArrowLeft,
  Users,
  Trophy,
  Lightbulb,
  DollarSign,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default async function RequestReviewDetailPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  await requireRole(['officer', 'admin']);
  const db = getDb();
  const { kind, id } = await params;

  let requestData: any = null;
  let requester: any = null;

  if (kind === 'team') {
    requestData = db.team_requests.find((r) => r.id === id);
  } else if (kind === 'competition') {
    requestData = db.competition_requests.find((r) => r.id === id);
  } else if (kind === 'workshop') {
    requestData = db.workshop_requests.find((r) => r.id === id);
  } else if (kind === 'funding') {
    requestData = db.funding_requests.find((r) => r.id === id);
  }

  if (!requestData) {
    notFound();
  }

  requester = db.profiles.find((p) => p.id === requestData.requested_by);

  // Extra relationships
  const comp =
    kind === 'team' || kind === 'funding'
      ? db.competitions.find((c) => c.id === requestData.competition_id)
      : null;

  const team =
    kind === 'funding'
      ? db.teams.find((t) => t.id === requestData.team_id)
      : null;

  const lineItems =
    kind === 'funding'
      ? db.funding_line_items.filter((i) => i.funding_request_id === requestData.id)
      : [];

  const attachments =
    kind === 'funding'
      ? db.funding_attachments.filter((a) => a.funding_request_id === requestData.id)
      : [];

  const proposedMembers =
    kind === 'team' && requestData.proposed_member_ids
      ? db.profiles.filter((p) => requestData.proposed_member_ids.includes(p.id))
      : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/review"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to review queue
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-3xs uppercase font-bold tracking-wider">
            {kind} Request Review
          </Badge>
          <StatusBadge status={requestData.status} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {requestData.proposed_name || requestData.name || requestData.topic || requestData.title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submitted by <strong className="font-semibold text-slate-800 dark:text-slate-200">{requester?.full_name || requester?.email}</strong> ({requester?.email}) on {new Date(requestData.created_at).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Proposal Details & Rationale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                {requestData.purpose || requestData.why || requestData.rationale || requestData.justification}
              </div>

              {kind === 'team' && comp && (
                <div className="text-xs space-y-1">
                  <span className="text-slate-500">Target Competition: </span>
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">{comp.name}</strong>
                </div>
              )}

              {kind === 'team' && proposedMembers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Proposed Initial Members ({proposedMembers.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {proposedMembers.map((m) => (
                      <span key={m.id} className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        {m.full_name || m.email}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {kind === 'competition' && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  {requestData.organizer && (
                    <div>
                      <span className="text-slate-500">Organizer: </span>
                      <strong className="font-semibold">{requestData.organizer}</strong>
                    </div>
                  )}
                  {requestData.url && (
                    <div>
                      <a href={requestData.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                        <span>Official Rules & Website</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {requestData.estimated_cost_cents !== undefined && (
                    <div>
                      <span className="text-slate-500">Estimated Budget: </span>
                      <strong className="font-semibold text-emerald-600">${(requestData.estimated_cost_cents / 100).toFixed(2)}</strong>
                    </div>
                  )}
                  {requestData.estimated_team_size && (
                    <div>
                      <span className="text-slate-500">Est. Team Size: </span>
                      <strong className="font-semibold">{requestData.estimated_team_size} members</strong>
                    </div>
                  )}
                </div>
              )}

              {kind === 'workshop' && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500">Instructor Offer: </span>
                    <strong className="font-semibold">{requestData.offering_to_teach ? 'Yes (Requester volunteering to teach)' : 'No (Requesting expert / peer)'}</strong>
                  </div>
                  {requestData.preferred_timeframe && (
                    <div>
                      <span className="text-slate-500">Preferred Timeframe: </span>
                      <strong className="font-semibold">{requestData.preferred_timeframe}</strong>
                    </div>
                  )}
                </div>
              )}

              {kind === 'funding' && lineItems.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Itemized Line Items ({lineItems.length})
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      Total: ${(requestData.amount_requested_cents / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-2xs uppercase text-slate-500 font-semibold border-b">
                        <tr>
                          <th className="py-2 px-3">Item</th>
                          <th className="py-2 px-3">Vendor</th>
                          <th className="py-2 px-3 text-right">Price</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 px-3 font-medium">{item.description}</td>
                            <td className="py-2 px-3 text-slate-500">{item.vendor || 'N/A'}</td>
                            <td className="py-2 px-3 text-right">${(item.unit_cost_cents / 100).toFixed(2)}</td>
                            <td className="py-2 px-3 text-center">{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-semibold">${((item.unit_cost_cents * item.quantity) / 100).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {attachments.length > 0 && (
                    <div className="pt-2 text-xs">
                      <span className="text-slate-500 font-semibold">Attached Receipts: </span>
                      {attachments.map((a) => (
                        <span key={a.id} className="inline-flex items-center gap-1 ml-2 text-brand-600 font-medium">
                          <FileText className="h-3 w-3" /> {a.filename}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Decision Form */}
        <div>
          <ReviewDecisionForm
            kind={kind as any}
            requestId={requestData.id}
            currentStatus={requestData.status}
            requestedAmountCents={requestData.amount_requested_cents}
          />
        </div>
      </div>
    </div>
  );
}
