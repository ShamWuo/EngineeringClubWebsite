import React from 'react';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { StatusBadge } from '@/components/domain/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Send, Trophy, Users, Lightbulb, DollarSign, HelpCircle, ArrowRight, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Request Center — FHS Engineering',
  description: 'Submit and track your competition, funding, subteam, workshop, and equipment requests.',
};

export default async function RequestsPage() {
  const user = await requireRole(['member', 'officer', 'admin']);
  const db = getDb();

  // Fetch all requests by this user
  const compRequests = db.competition_requests
    .filter((r) => r.requested_by === user.id)
    .map((r) => ({
      id: r.id,
      kind: 'competition' as const,
      title: r.name,
      subtitle: r.organizer || 'External Competition',
      summary: r.why,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    }));

  const teamRequests = db.team_requests
    .filter((r) => r.requested_by === user.id)
    .map((r) => {
      const comp = db.competitions.find((c) => c.id === r.competition_id);
      return {
        id: r.id,
        kind: 'team' as const,
        title: r.proposed_name,
        subtitle: comp?.name || 'Competition Team',
        summary: r.purpose,
        status: r.status,
        reviewNote: r.review_note,
        createdAt: r.created_at,
      };
    });

  const workshopRequests = db.workshop_requests
    .filter((r) => r.requested_by === user.id)
    .map((r) => ({
      id: r.id,
      kind: 'workshop' as const,
      title: r.topic,
      subtitle: r.offering_to_teach ? 'Offering to teach' : 'Topic suggestion',
      summary: r.rationale,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    }));

  const fundingRequests = db.funding_requests
    .filter((r) => r.requested_by === user.id)
    .map((r) => ({
      id: r.id,
      kind: 'funding' as const,
      title: r.title,
      subtitle: `$${(r.amount_requested_cents / 100).toFixed(2)} requested`,
      summary: r.justification,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    }));

  const generalRequests = (db.general_requests || [])
    .filter((r) => r.requested_by === user.id)
    .map((r) => ({
      id: r.id,
      kind: 'general' as const,
      title: r.title,
      subtitle: `Category: ${r.category} • Urgency: ${r.urgency}`,
      summary: r.description,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    }));

  const allRequests = [
    ...compRequests,
    ...teamRequests,
    ...workshopRequests,
    ...fundingRequests,
    ...generalRequests,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case 'competition':
        return { label: 'Competition', icon: Trophy, bg: 'bg-amber-950/60 text-amber-400 border-amber-800' };
      case 'team':
        return { label: 'Subteam', icon: Users, bg: 'bg-red-950/60 text-red-400 border-red-800' };
      case 'workshop':
        return { label: 'Workshop', icon: Lightbulb, bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800' };
      case 'funding':
        return { label: 'Funding', icon: DollarSign, bg: 'bg-purple-950/60 text-purple-400 border-purple-800' };
      default:
        return { label: 'General / Tool', icon: HelpCircle, bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black p-6 rounded-2xl border border-zinc-800/80 shadow-xl shadow-red-950/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-2xs font-mono uppercase tracking-widest text-red-400 font-bold">
              Engineering Club Hub
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Request Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Propose new competitions, request hardware funding, form subteams, suggest workshops, or request lab equipment access.
          </p>
        </div>
        <Link href="/requests/new">
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2 text-xs shadow-lg shadow-red-950/50 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>New Request</span>
          </Button>
        </Link>
      </div>

      {/* Quick Category Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Link href="/requests/new?type=competition" className="group">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-600/50 transition-all text-center space-y-2 cursor-pointer h-full flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-amber-400">Competition</div>
              <div className="text-3xs text-zinc-500">Enter a challenge</div>
            </div>
          </div>
        </Link>

        <Link href="/requests/new?type=funding" className="group">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-600/50 transition-all text-center space-y-2 cursor-pointer h-full flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-purple-950/50 text-purple-400 border border-purple-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-purple-400">Funding / Parts</div>
              <div className="text-3xs text-zinc-500">Hardware & quotes</div>
            </div>
          </div>
        </Link>

        <Link href="/requests/new?type=team" className="group">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-600/50 transition-all text-center space-y-2 cursor-pointer h-full flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-red-950/50 text-red-400 border border-red-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-red-400">Subteam</div>
              <div className="text-3xs text-zinc-500">Recruit & build</div>
            </div>
          </div>
        </Link>

        <Link href="/requests/new?type=workshop" className="group">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-600/50 transition-all text-center space-y-2 cursor-pointer h-full flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400">Workshop</div>
              <div className="text-3xs text-zinc-500">Learn or teach</div>
            </div>
          </div>
        </Link>

        <Link href="/requests/new?type=general" className="group col-span-2 md:col-span-1">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-900 hover:border-red-600/50 transition-all text-center space-y-2 cursor-pointer h-full flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-zinc-100">Equipment / Other</div>
              <div className="text-3xs text-zinc-500">Tools, ideas, access</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Requests History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>My Submitted Requests</span>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
              {allRequests.length}
            </span>
          </h2>
        </div>

        {allRequests.length === 0 ? (
          <Card className="border-dashed border-zinc-800 bg-zinc-950/40 text-center py-12">
            <CardContent className="space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 border border-zinc-800">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-zinc-300">No requests submitted yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Have an idea for a project, need equipment, or want to launch a competition team? Submit your first request.
              </p>
              <Link href="/requests/new">
                <Button className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold">
                  Submit a Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allRequests.map((req) => {
              const badge = getKindBadge(req.kind);
              const Icon = badge.icon;

              return (
                <div
                  key={`${req.kind}-${req.id}`}
                  className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-3xs font-bold uppercase border ${badge.bg}`}>
                        <Icon className="h-3 w-3" />
                        <span>{badge.label}</span>
                      </span>
                      <h3 className="font-bold text-sm text-zinc-100">{req.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xs text-zinc-500 font-mono">
                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <StatusBadge status={req.status as any} />
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 line-clamp-2">
                    {req.summary}
                  </div>

                  {req.reviewNote && (
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-red-400">Officer Note: </span>
                        <span>{req.reviewNote}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
