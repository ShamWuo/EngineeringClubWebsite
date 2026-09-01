'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { fundingRequestSchema, fundingReviewSchema } from '@/lib/validation/schemas';
import type { FundingStatus } from '@/lib/db/types';

export const submitFundingRequest = createAction(
  fundingRequestSchema.extend({
    receipt_filename: z.string().optional(),
    receipt_storage_path: z.string().optional(),
  }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    const totalCents = input.line_items.reduce(
      (sum, item) => sum + item.unit_cost_cents * item.quantity,
      0
    );

    const fundingReqId = crypto.randomUUID();

    const fundingReq = {
      id: fundingReqId,
      requested_by: user.id,
      team_id: input.team_id || null,
      competition_id: input.competition_id || null,
      title: input.title,
      justification: input.justification || null,
      amount_requested_cents: totalCents,
      amount_approved_cents: null,
      status: 'pending' as FundingStatus,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      reimbursed_at: null,
      created_at: now,
      updated_at: now,
    };

    if (supabase) {
      await supabase.from('funding_requests').insert(fundingReq);

      const items = input.line_items.map((item) => ({
        id: crypto.randomUUID(),
        funding_request_id: fundingReqId,
        description: item.description,
        vendor: item.vendor || null,
        unit_cost_cents: item.unit_cost_cents,
        quantity: item.quantity,
        url: item.url || null,
        created_at: now,
      }));

      await supabase.from('funding_line_items').insert(items);

      if (input.receipt_storage_path && input.receipt_filename) {
        await supabase.from('funding_attachments').insert({
          id: crypto.randomUUID(),
          funding_request_id: fundingReqId,
          storage_path: input.receipt_storage_path,
          filename: input.receipt_filename,
          uploaded_by: user.id,
          created_at: now,
        });
      }

      const { data: officers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['officer', 'admin']);

      if (officers && officers.length > 0) {
        const notifications = officers.map((off: { id: string }) => ({
          user_id: off.id,
          kind: 'new_request',
          title: 'New Funding Request 💰',
          body: `${user.full_name || user.email} requested $${(totalCents / 100).toFixed(2)} for "${input.title}"`,
          href: '/review',
        }));
        await supabase.from('notifications').insert(notifications);
      }
    }

    db.funding_requests.push(fundingReq);

    input.line_items.forEach((item) => {
      db.funding_line_items.push({
        id: crypto.randomUUID(),
        funding_request_id: fundingReqId,
        description: item.description,
        vendor: item.vendor || null,
        unit_cost_cents: item.unit_cost_cents,
        quantity: item.quantity,
        url: item.url || null,
        created_at: now,
      });
    });

    safeRevalidatePath('/requests');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/review');
    return { request: fundingReq };
  }
);

export const reviewFundingRequest = createAction(
  fundingReviewSchema,
  { role: ['officer', 'admin'] },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();
    const req = db.funding_requests.find((f) => f.id === input.request_id);

    let newStatus: FundingStatus;
    let approvedCents: number | null = null;

    if (input.action === 'approve') {
      approvedCents = input.approved_amount_cents ?? (req?.amount_requested_cents || 0);
      newStatus = approvedCents < (req?.amount_requested_cents || 0) ? 'partially_approved' : 'approved';
    } else if (input.action === 'reject') {
      newStatus = 'rejected';
      approvedCents = 0;
    } else {
      newStatus = 'pending';
    }

    if (supabase) {
      await supabase
        .from('funding_requests')
        .update({
          status: newStatus,
          amount_approved_cents: approvedCents,
          reviewed_by: user.id,
          reviewed_at: now,
          review_note: input.note || null,
          updated_at: now,
        })
        .eq('id', input.request_id);
    }

    if (req) {
      req.status = newStatus;
      req.amount_approved_cents = approvedCents;
      req.reviewed_by = user.id;
      req.reviewed_at = now;
      req.review_note = input.note || null;
      req.updated_at = now;
    }

    safeRevalidatePath('/requests');
    safeRevalidatePath('/review');
    return { request: req || { id: input.request_id, status: newStatus } };
  }
);
