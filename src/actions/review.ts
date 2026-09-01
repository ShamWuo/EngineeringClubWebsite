'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';

export const reviewRequestAction = createAction(
  z.object({
    kind: z.enum(['team', 'competition', 'workshop', 'funding']),
    requestId: z.string().uuid(),
    decision: z.enum(['approve', 'reject', 'changes_requested']),
    note: z.string().optional().nullable(),
    fundingApprovedAmountCents: z.coerce.number().int().min(0).optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, db }) => {
    const now = new Date().toISOString();
    const { kind, requestId, decision, note } = input;

    if (decision === 'approve') {
      if (kind === 'team') {
        const req = db.team_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Team request not found.');
        if (req.status !== 'pending' && req.status !== 'changes_requested') {
          throw new Error('Request has already been processed.');
        }

        const comp = db.competitions.find((c) => c.id === req.competition_id);

        // 1. Create team
        const teamId = crypto.randomUUID();
        const newTeam = {
          id: teamId,
          competition_id: req.competition_id,
          name: req.proposed_name,
          description: req.purpose,
          is_recruiting: true,
          created_by: req.requested_by,
          created_at: now,
          updated_at: now,
        };
        db.teams.push(newTeam);

        // 2. Add lead
        db.team_members.push({
          team_id: teamId,
          user_id: req.requested_by,
          role: 'lead',
          joined_at: now,
        });

        // 3. Add proposed members
        (req.proposed_member_ids || []).forEach((memId) => {
          if (memId !== req.requested_by) {
            const exists = db.team_members.some(
              (m) => m.team_id === teamId && m.user_id === memId
            );
            if (!exists) {
              db.team_members.push({
                team_id: teamId,
                user_id: memId,
                role: 'member',
                joined_at: now,
              });
            }
          }
        });

        // 4. Auto-approve competition signup
        const signup = db.competition_signups.find(
          (s) => s.competition_id === req.competition_id && s.user_id === req.requested_by
        );
        if (signup) {
          signup.status = 'approved';
        }

        // 5. Update request status
        req.status = 'approved';
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.created_team_id = teamId;
        req.updated_at = now;

        // 6. Notify requester
        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: req.requested_by,
          kind: 'team_approved',
          title: 'Team Request Approved! 🎉',
          body: `Your team "${req.proposed_name}" for ${comp?.name || 'competition'} has been approved.`,
          href: `/teams/${teamId}`,
          read_at: null,
          created_at: now,
        });

        // 7. Audit log
        db.audit_log.push({
          id: db.audit_log.length + 1,
          actor_id: user.id,
          action: 'approve_team_request',
          entity_type: 'team_requests',
          entity_id: requestId,
          diff: { created_team_id: teamId, note },
          created_at: now,
        });

        safeRevalidatePath('/competitions');
        safeRevalidatePath('/teams');
        safeRevalidatePath(`/teams/${teamId}`);
        safeRevalidatePath('/review');
        safeRevalidatePath('/dashboard');
        return { createdEntityId: teamId };
      } else if (kind === 'competition') {
        const req = db.competition_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Competition request not found.');

        const baseSlug = req.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

        const compId = crypto.randomUUID();
        const newComp = {
          id: compId,
          slug,
          name: req.name,
          description: req.why,
          organizer: req.organizer || null,
          status: 'planned' as const,
          season: '2026-27',
          registration_opens_at: now,
          registration_closes_at: null,
          event_starts_at: null,
          event_ends_at: null,
          max_teams: 2,
          max_team_size: req.estimated_team_size || 10,
          entry_fee_cents: req.estimated_cost_cents || 0,
          external_url: req.url || null,
          created_by: req.requested_by,
          created_at: now,
          updated_at: now,
        };
        db.competitions.push(newComp);

        req.status = 'approved';
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.created_competition_id = compId;
        req.updated_at = now;

        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: req.requested_by,
          kind: 'competition_approved',
          title: 'Competition Request Approved! 🚀',
          body: `Your proposal for "${req.name}" is approved!`,
          href: `/competitions/${slug}`,
          read_at: null,
          created_at: now,
        });

        db.audit_log.push({
          id: db.audit_log.length + 1,
          actor_id: user.id,
          action: 'approve_competition_request',
          entity_type: 'competition_requests',
          entity_id: requestId,
          diff: { created_competition_id: compId, note },
          created_at: now,
        });

        safeRevalidatePath('/competitions');
        safeRevalidatePath('/review');
        safeRevalidatePath('/dashboard');
        return { createdEntityId: compId };
      } else if (kind === 'workshop') {
        const req = db.workshop_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Workshop request not found.');

        const baseSlug = req.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

        const workshopId = crypto.randomUUID();
        const newWorkshop = {
          id: workshopId,
          slug,
          title: req.topic,
          description: req.rationale,
          instructor_id: req.offering_to_teach ? req.requested_by : null,
          instructor_name: req.offering_to_teach
            ? db.profiles.find((p) => p.id === req.requested_by)?.full_name || null
            : null,
          status: 'scheduled' as const,
          starts_at: new Date(Date.now() + 14 * 86400000).toISOString(),
          ends_at: new Date(Date.now() + 14 * 86400000 + 2 * 3600000).toISOString(),
          location: 'Engineering Hub & Online',
          capacity: 25,
          skill_level: 'All Levels',
          materials_url: null,
          recording_url: null,
          created_by: req.requested_by,
          created_at: now,
          updated_at: now,
        };
        db.workshops.push(newWorkshop);

        req.status = 'approved';
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.created_workshop_id = workshopId;
        req.updated_at = now;

        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: req.requested_by,
          kind: 'workshop_approved',
          title: 'Workshop Request Scheduled! 💡',
          body: `Your workshop topic "${req.topic}" is now scheduled.`,
          href: `/workshops/${slug}`,
          read_at: null,
          created_at: now,
        });

        db.audit_log.push({
          id: db.audit_log.length + 1,
          actor_id: user.id,
          action: 'approve_workshop_request',
          entity_type: 'workshop_requests',
          entity_id: requestId,
          diff: { created_workshop_id: workshopId, note },
          created_at: now,
        });

        safeRevalidatePath('/workshops');
        safeRevalidatePath('/review');
        safeRevalidatePath('/dashboard');
        return { createdEntityId: workshopId };
      } else if (kind === 'funding') {
        const req = db.funding_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Funding request not found.');

        const approvedCents = input.fundingApprovedAmountCents ?? req.amount_requested_cents;
        const newStatus = approvedCents < req.amount_requested_cents ? 'partially_approved' : 'approved';

        req.status = newStatus;
        req.amount_approved_cents = approvedCents;
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.updated_at = now;

        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: req.requested_by,
          kind: 'funding_approved',
          title: 'Funding Request Approved! 💰',
          body: `Your request "${req.title}" was approved for $${(approvedCents / 100).toFixed(2)}.`,
          href: '/funding',
          read_at: null,
          created_at: now,
        });

        db.audit_log.push({
          id: db.audit_log.length + 1,
          actor_id: user.id,
          action: 'approve_funding_request',
          entity_type: 'funding_requests',
          entity_id: requestId,
          diff: { status: newStatus, approved_cents: approvedCents, note },
          created_at: now,
        });

        safeRevalidatePath('/funding');
        safeRevalidatePath('/manage/funding');
        safeRevalidatePath('/review');
        safeRevalidatePath('/dashboard');
        return { createdEntityId: requestId };
      }
    } else {
      // Reject or Changes Requested
      let targetUserId = '';
      let targetTitle = '';

      if (kind === 'team') {
        const req = db.team_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Team request not found.');
        req.status = decision === 'reject' ? 'rejected' : 'changes_requested';
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.updated_at = now;
        targetUserId = req.requested_by;
        targetTitle = req.proposed_name;
      } else if (kind === 'competition') {
        const req = db.competition_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Competition request not found.');
        req.status = decision === 'reject' ? 'rejected' : 'changes_requested';
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.updated_at = now;
        targetUserId = req.requested_by;
        targetTitle = req.name;
      } else if (kind === 'workshop') {
        const req = db.workshop_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Workshop request not found.');
        req.status = decision === 'reject' ? 'rejected' : 'changes_requested';
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.updated_at = now;
        targetUserId = req.requested_by;
        targetTitle = req.topic;
      } else if (kind === 'funding') {
        const req = db.funding_requests.find((r) => r.id === requestId);
        if (!req) throw new Error('Funding request not found.');
        req.status = decision === 'reject' ? 'rejected' : 'pending';
        req.reviewed_by = user.id;
        req.reviewed_at = now;
        req.review_note = note || null;
        req.updated_at = now;
        targetUserId = req.requested_by;
        targetTitle = req.title;
      }

      db.notifications.push({
        id: crypto.randomUUID(),
        user_id: targetUserId,
        kind: 'request_update',
        title: `Request ${decision === 'reject' ? 'Rejected' : 'Needs Changes'}`,
        body: `Your ${kind} request "${targetTitle}" was updated. Note: ${note || 'None'}`,
        href: kind === 'funding' ? '/funding' : '/dashboard',
        read_at: null,
        created_at: now,
      });

      db.audit_log.push({
        id: db.audit_log.length + 1,
        actor_id: user.id,
        action: `decide_${kind}_request`,
        entity_type: `${kind}_requests`,
        entity_id: requestId,
        diff: { status: decision, note },
        created_at: now,
      });

      safeRevalidatePath('/review');
      safeRevalidatePath('/dashboard');
      return { success: true };
    }
  }
);
