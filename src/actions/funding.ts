'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { fundingRequestSchema, fundingReviewSchema } from '@/lib/validation/schemas';
import type { FundingStatus } from '@/lib/db/types';

export const submitFundingRequest = createAction(
  fundingRequestSchema.extend({
    receipt_filename: z.string().optional(),
    receipt_storage_path: z.string().optional(),
  }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const now = new Date().toISOString();

    // Calculate total
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

    db.funding_requests.push(fundingReq);

    // Insert line items
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

    // Insert attachment if provided
    if (input.receipt_storage_path && input.receipt_filename) {
      db.funding_attachments.push({
        id: crypto.randomUUID(),
        funding_request_id: fundingReqId,
        storage_path: input.receipt_storage_path,
        filename: input.receipt_filename,
        uploaded_by: user.id,
        created_at: now,
      });
    }

    // Notify officers
    db.profiles
      .filter((p) => p.role === 'officer' || p.role === 'admin')
      .forEach((officer) => {
        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: officer.id,
          kind: 'new_request',
          title: 'New Funding Request 💰',
          body: `${user.full_name || user.email} requested $${(totalCents / 100).toFixed(2)} for "${input.title}"`,
          href: '/review',
          read_at: null,
          created_at: now,
        });
      });

    revalidatePath('/funding');
    revalidatePath('/dashboard');
    revalidatePath('/review');
    return { request: fundingReq };
  }
);

export const reviewFundingRequest = createAction(
  fundingReviewSchema,
  { role: ['officer', 'admin'] },
  async (input, { user, db }) => {
    const req = db.funding_requests.find((f) => f.id === input.request_id);
    if (!req) throw new Error('Funding request not found.');

    const now = new Date().toISOString();
    let newStatus: FundingStatus;

    if (input.action === 'approve') {
      const approvedCents = input.approved_amount_cents ?? req.amount_requested_cents;
      if (approvedCents < req.amount_requested_cents) {
        newStatus = 'partially_approved';
      } else {
        newStatus = 'approved';
      }
      req.amount_approved_cents = approvedCents;
    } else if (input.action === 'reject') {
      newStatus = 'rejected';
      req.amount_approved_cents = 0;
    } else {
      newStatus = 'pending';
    }

    req.status = newStatus;
    req.reviewed_by = user.id;
    req.reviewed_at = now;
    req.review_note = input.note || null;
    req.updated_at = now;

    // Notify requester
    db.notifications.push({
      id: crypto.randomUUID(),
      user_id: req.requested_by,
      kind: 'funding_decision',
      title: `Funding Request ${newStatus.toUpperCase()} 💵`,
      body: `Your request "${req.title}" was updated to ${newStatus}. Note: ${input.note || 'None'}`,
      href: '/funding',
      read_at: null,
      created_at: now,
    });

    db.audit_log.push({
      id: db.audit_log.length + 1,
      actor_id: user.id,
      action: 'review_funding_request',
      entity_type: 'funding_requests',
      entity_id: req.id,
      diff: { status: newStatus, approved_cents: req.amount_approved_cents, note: input.note },
      created_at: now,
    });

    revalidatePath('/funding');
    revalidatePath('/manage/funding');
    revalidatePath('/review');
    return { request: req };
  }
);

export const markFundingReimbursed = createAction(
  z.object({ request_id: z.string().uuid() }),
  { role: ['officer', 'admin'] },
  async (input, { user, db }) => {
    const req = db.funding_requests.find((f) => f.id === input.request_id);
    if (!req) throw new Error('Funding request not found.');

    const now = new Date().toISOString();
    req.status = 'reimbursed';
    req.reimbursed_at = now;
    req.updated_at = now;

    db.notifications.push({
      id: crypto.randomUUID(),
      user_id: req.requested_by,
      kind: 'funding_reimbursed',
      title: 'Funds Reimbursed! 🏦',
      body: `Reimbursement processed for "${req.title}".`,
      href: '/funding',
      read_at: null,
      created_at: now,
    });

    db.audit_log.push({
      id: db.audit_log.length + 1,
      actor_id: user.id,
      action: 'reimburse_funding_request',
      entity_type: 'funding_requests',
      entity_id: req.id,
      diff: { status: 'reimbursed', reimbursed_at: now },
      created_at: now,
    });

    revalidatePath('/funding');
    revalidatePath('/manage/funding');
    return { request: req };
  }
);
