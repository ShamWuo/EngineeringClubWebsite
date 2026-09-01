import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { getDb } from '@/lib/db/mock-data';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'officer' && user.role !== 'admin')) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  const db = getDb();
  const requests = db.funding_requests;
  const lineItems = db.funding_line_items;
  const profiles = db.profiles;
  const teams = db.teams;
  const competitions = db.competitions;

  const headers = [
    'Request ID',
    'Date Submitted',
    'Requester Name',
    'Requester Email',
    'Team',
    'Competition',
    'Title',
    'Status',
    'Amount Requested ($)',
    'Amount Approved ($)',
    'Line Item Description',
    'Vendor',
    'Unit Cost ($)',
    'Quantity',
    'Line Total ($)',
    'Reimbursed Date',
  ];

  const rows: string[][] = [headers];

  requests.forEach((req) => {
    const requester = profiles.find((p) => p.id === req.requested_by);
    const team = teams.find((t) => t.id === req.team_id);
    const comp = competitions.find((c) => c.id === req.competition_id);
    const items = lineItems.filter((i) => i.funding_request_id === req.id);

    if (items.length === 0) {
      rows.push([
        req.id,
        req.created_at.split('T')[0],
        requester?.full_name || 'Unknown',
        requester?.email || '',
        team?.name || 'N/A',
        comp?.name || 'N/A',
        `"${req.title.replace(/"/g, '""')}"`,
        req.status,
        (req.amount_requested_cents / 100).toFixed(2),
        req.amount_approved_cents ? (req.amount_approved_cents / 100).toFixed(2) : '0.00',
        'N/A',
        'N/A',
        '0.00',
        '0',
        '0.00',
        req.reimbursed_at ? req.reimbursed_at.split('T')[0] : 'Pending',
      ]);
    } else {
      items.forEach((item) => {
        const lineTotal = (item.unit_cost_cents * item.quantity) / 100;
        rows.push([
          req.id,
          req.created_at.split('T')[0],
          requester?.full_name || 'Unknown',
          requester?.email || '',
          team?.name || 'N/A',
          comp?.name || 'N/A',
          `"${req.title.replace(/"/g, '""')}"`,
          req.status,
          (req.amount_requested_cents / 100).toFixed(2),
          req.amount_approved_cents ? (req.amount_approved_cents / 100).toFixed(2) : '0.00',
          `"${item.description.replace(/"/g, '""')}"`,
          `"${(item.vendor || 'N/A').replace(/"/g, '""')}"`,
          (item.unit_cost_cents / 100).toFixed(2),
          item.quantity.toString(),
          lineTotal.toFixed(2),
          req.reimbursed_at ? req.reimbursed_at.split('T')[0] : 'Pending',
        ]);
      });
    }
  });

  const csvString = rows.map((r) => r.join(',')).join('\n');

  return new NextResponse(csvString, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="club-funding-spend-report.csv"',
    },
  });
}
