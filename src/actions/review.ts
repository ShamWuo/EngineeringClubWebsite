'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';

export const reviewRequestAction = createAction(
  z.object({
    kind: z.enum(['team', 'competition', 'workshop', 'funding', 'general']),
    requestId: z.string().uuid(),
    decision: z.enum(['approve', 'reject', 'changes_requested']),
    note: z.string().optional().nullable(),
    fundingApprovedAmountCents: z.coerce.number().int().min(0).optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();
    const { kind, requestId, decision, note } = input;

    if (supabase) {
      try {
        if (decision === 'approve') {
          if (kind === 'team') {
            await supabase.rpc('approve_team_request', {
              p_request_id: requestId,
              p_reviewer_id: user.id,
              p_note: note || null,
            });
          } else if (kind === 'competition') {
            await supabase.rpc('approve_competition_request', {
              p_request_id: requestId,
              p_reviewer_id: user.id,
              p_note: note || null,
            });
          } else if (kind === 'workshop') {
            await supabase.rpc('approve_workshop_request', {
              p_request_id: requestId,
              p_reviewer_id: user.id,
              p_note: note || null,
            });
          } else if (kind === 'funding') {
            await supabase.rpc('approve_funding_request', {
              p_request_id: requestId,
              p_reviewer_id: user.id,
              p_approved_cents: input.fundingApprovedAmountCents || 0,
              p_note: note || null,
            });
          } else if (kind === 'general') {
            await supabase
              .from('general_requests')
              .update({
                status: 'approved',
                reviewed_by: user.id,
                reviewed_at: now,
                review_note: note || null,
                updated_at: now,
              })
              .eq('id', requestId);
          }
        } else {
          // Reject or changes requested
          await supabase.rpc('decide_request', {
            p_kind: kind,
            p_request_id: requestId,
            p_reviewer_id: user.id,
            p_new_status: decision,
            p_note: note || null,
          });
        }
      } catch (rpcErr) {
        console.warn('Supabase review RPC execution warning:', rpcErr);
      }
    }

    // In-memory fallback/test sync
    if (decision === 'approve') {
      if (kind === 'general') {
        const req = (db.general_requests || []).find((r) => r.id === requestId);
        if (req) {
          req.status = 'approved';
          req.reviewed_by = user.id;
          req.reviewed_at = now;
          req.review_note = note || null;
          req.updated_at = now;
        }
        safeRevalidatePath('/requests');
        safeRevalidatePath('/review');
        safeRevalidatePath('/dashboard');
        return { createdEntityId: requestId };
      } else if (kind === 'team') {
        const req = db.team_requests.find((r) => r.id === requestId);
        if (req) {
          const teamId = crypto.randomUUID();
          db.teams.push({
            id: teamId,
            competition_id: req.competition_id,
            name: req.proposed_name,
            description: req.purpose,
            is_recruiting: true,
            created_by: req.requested_by,
            created_at: now,
            updated_at: now,
          });

          db.team_members.push({
            team_id: teamId,
            user_id: req.requested_by,
            role: 'lead',
            joined_at: now,
          });

          req.status = 'approved';
          req.created_team_id = teamId;
          req.reviewed_by = user.id;
          req.reviewed_at = now;
          req.review_note = note || null;
          req.updated_at = now;
          return { createdEntityId: teamId };
        }
      } else if (kind === 'funding') {
        const req = db.funding_requests.find((r) => r.id === requestId);
        if (req) {
          const approvedCents = input.fundingApprovedAmountCents ?? req.amount_requested_cents;
          req.status = approvedCents < req.amount_requested_cents ? 'partially_approved' : 'approved';
          req.amount_approved_cents = approvedCents;
          req.reviewed_by = user.id;
          req.reviewed_at = now;
          req.review_note = note || null;
          req.updated_at = now;
        }
      }
    }

    safeRevalidatePath('/requests');
    safeRevalidatePath('/competitions');
    safeRevalidatePath('/workshops');
    safeRevalidatePath('/review');
    safeRevalidatePath('/dashboard');
    return { success: true };
  }
);
