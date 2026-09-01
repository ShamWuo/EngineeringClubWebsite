import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/domain/status-badge';
import { EmptyState } from '@/components/domain/empty-state';
import { DollarSign, Plus, CheckCircle2, Clock, FileText, ArrowRight, ExternalLink } from 'lucide-react';

export default async function FundingPage() {
  const user = await requireUser();
  const db = getDb();

  const myTeamMemberships = db.team_members.filter((m) => m.user_id === user.id);
  const myTeamIds = myTeamMemberships.map((m) => m.team_id);

  const fundingRequests = db.funding_requests.filter(
    (f) => f.requested_by === user.id || (f.team_id && myTeamIds.includes(f.team_id))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalRequestedCents = fundingRequests.reduce((sum, f) => sum + f.amount_requested_cents, 0);
  const totalApprovedCents = fundingRequests.reduce((sum, f) => sum + (f.amount_approved_cents || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            Project & Team Funding Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit line-item procurement requests for competition hardware, electronics, raw stock, and safety equipment.
          </p>
        </div>

        <Link href="/funding/new">
          <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            New Funding Request
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 font-medium">Total Requests Filed</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {fundingRequests.length}
          </div>
        </Card>
        <Card className="p-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 font-medium">Total Requested</div>
          <div className="text-2xl font-black text-brand-600 mt-1">
            ${(totalRequestedCents / 100).toFixed(2)}
          </div>
        </Card>
        <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Total Approved</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ${(totalApprovedCents / 100).toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          My Requests & Subteam Grants
        </h2>

        {fundingRequests.length === 0 ? (
          <EmptyState
            title="No Funding Requests Yet"
            description="Submit a procurement proposal with itemized parts, prices, and vendor quotes."
            actionHref="/funding/new"
            actionLabel="Create Funding Request"
          />
        ) : (
          <div className="space-y-4">
            {fundingRequests.map((req) => {
              const team = db.teams.find((t) => t.id === req.team_id);
              const comp = db.competitions.find((c) => c.id === req.competition_id);
              const lineItems = db.funding_line_items.filter((i) => i.funding_request_id === req.id);
              const attachments = db.funding_attachments.filter((a) => a.funding_request_id === req.id);

              return (
                <Card key={req.id} className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {team && (
                          <span className="text-3xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                            Team: {team.name}
                          </span>
                        )}
                        {comp && (
                          <span className="text-3xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded">
                            {comp.name}
                          </span>
                        )}
                        <StatusBadge status={req.status} className="text-3xs" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {req.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Submitted on {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                        ${(req.amount_requested_cents / 100).toFixed(2)}
                      </div>
                      {req.amount_approved_cents !== null && req.amount_approved_cents !== undefined && (
                        <div className="text-xs font-bold text-emerald-600">
                          Approved: ${(req.amount_approved_cents / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {req.justification && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg mb-4 leading-relaxed">
                      <strong className="text-slate-800 dark:text-slate-200">Justification: </strong>
                      {req.justification}
                    </p>
                  )}

                  {/* Line Items Breakdown Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800/80 mb-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-2xs uppercase text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Item Description</th>
                          <th className="py-2 px-3">Vendor</th>
                          <th className="py-2 px-3 text-right">Unit Price</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                              {item.url ? (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline flex items-center gap-1">
                                  <span>{item.description}</span>
                                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                </a>
                              ) : (
                                item.description
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-500">{item.vendor || 'N/A'}</td>
                            <td className="py-2 px-3 text-right">${(item.unit_cost_cents / 100).toFixed(2)}</td>
                            <td className="py-2 px-3 text-center">{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                              ${((item.unit_cost_cents * item.quantity) / 100).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {req.review_note && (
                    <div className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
                      <strong>Officer Review Note: </strong>{req.review_note}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
