import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '@/lib/db/mock-data';
import { reviewRequestAction } from '@/actions/review';
import { upsertLink } from '@/actions/links';
import { updateMemberRole } from '@/actions/admin';

describe('Server Actions & Atomic Side-Effects', () => {
  beforeEach(() => {
    resetDb();
  });

  describe('Review Queue Workflow', () => {
    it('approving a team request atomically creates the team, designates lead, and links records', async () => {
      const db = getDb();
      const initialTeamCount = db.teams.length;
      const initialPendingReq = db.team_requests.find((r) => r.id === '30000001-1111-1111-1111-111111111111')!;
      expect(initialPendingReq.status).toBe('pending');

      const res = await reviewRequestAction({
        kind: 'team',
        requestId: initialPendingReq.id,
        decision: 'approve',
        note: 'Approved for Formula season.',
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.createdEntityId).toBeDefined();
        // Verify team was created
        expect(db.teams.length).toBe(initialTeamCount + 1);
        const createdTeam = db.teams.find((t) => t.id === res.data.createdEntityId)!;
        expect(createdTeam.name).toBe(initialPendingReq.proposed_name);

        // Verify requester is assigned as lead
        const leadMember = db.team_members.find(
          (m) => m.team_id === createdTeam.id && m.user_id === initialPendingReq.requested_by
        );
        expect(leadMember).toBeDefined();
        expect(leadMember?.role).toBe('lead');

        // Verify request record was updated
        expect(initialPendingReq.status).toBe('approved');
        expect(initialPendingReq.created_team_id).toBe(createdTeam.id);
      }
    });

    it('approving a funding request adjusts amount approved and sets status', async () => {
      const db = getDb();
      const fundingReq = db.funding_requests.find((r) => r.id === '70000001-1111-1111-1111-111111111111')!;
      expect(fundingReq.status).toBe('pending');

      const res = await reviewRequestAction({
        kind: 'funding',
        requestId: fundingReq.id,
        decision: 'approve',
        fundingApprovedAmountCents: 40000, // Partial approval ($400 of $485)
        note: 'Approved up to $400 for standard contactors.',
      });

      expect(res.ok).toBe(true);
      expect(fundingReq.status).toBe('partially_approved');
      expect(fundingReq.amount_approved_cents).toBe(40000);
      expect(fundingReq.review_note).toContain('Approved up to $400');
    });
  });

  describe('Links Tier Constraints', () => {
    it('enforces maximum 4 active Tier 1 Primary links constraint', async () => {
      const db = getDb();
      const currentPrimaryCount = db.links.filter((l) => l.tier === 'primary' && l.is_active).length;
      expect(currentPrimaryCount).toBe(4);

      // Attempt to add a 5th primary link
      const res = await upsertLink({
        label: '5th Primary Link',
        url: 'https://example.com/extra',
        tier: 'primary',
        is_active: true,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain('maximum of 4 primary links');
      }
    });
  });

  describe('Admin Role Management', () => {
    it('allows club admin to promote a member to officer', async () => {
      const db = getDb();
      const member = db.profiles.find((p) => p.email === 'jordan.chen@university.edu')!;
      expect(member.role).toBe('member');

      const res = await updateMemberRole({
        user_id: member.id,
        role: 'officer',
        is_active: true,
      });

      expect(res.ok).toBe(true);
      expect(member.role).toBe('officer');
    });
  });
});
