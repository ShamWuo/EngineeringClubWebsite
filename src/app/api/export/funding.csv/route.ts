import { NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/lib/supabase/server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'officer' && user.role !== 'admin')) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  const supabase = await createClient();

  const [
    { data: requests },
    { data: lineItems },
    { data: profiles },
    { data: teams },
    { data: competitions },
  ] = await Promise.all([
    (supabase.from('funding_requests') as any).select('*'),
    (supabase.from('funding_line_items') as any).select('*'),
    (supabase.from('profiles') as any).select('*'),
    (supabase.from('teams') as any).select('*'),
    (supabase.from('competitions') as any).select('*'),
  ]);

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
  const teamMap = new Map((teams || []).map((t: any) => [t.id, t]));
  const compMap = new Map((competitions || []).map((c: any) => [c.id, c]));

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

  ((requests as any[]) || []).forEach((req: any) => {
    const requester: any = profileMap.get(req.requested_by);
    const team: any = req.team_id ? teamMap.get(req.team_id) : null;
    const comp: any = req.competition_id ? compMap.get(req.competition_id) : null;
    const items = ((lineItems as any[]) || []).filter((i: any) => i.funding_request_id === req.id);

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
      items.forEach((item: any) => {
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
