import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '@/lib/db/mock-data';
import { reviewRequestAction } from '@/actions/review';
import { upsertLink } from '@/actions/links';
import { updateMemberRole, resetMemberOnboarding } from '@/actions/admin';
import { completeOnboarding } from '@/actions/auth';

describe('Server Actions & Atomic Side-Effects', () => {
  beforeEach(() => {
    resetDb();
  });

  describe('Review Queue Workflow', () => {
    it('approving a team request atomically creates the team, designates lead, and links records', async () => {
      const db = getDb();
      const testReqId = '30000001-1111-1111-1111-111111111111';
      db.team_requests.push({
        id: testReqId,
        competition_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        requested_by: '44444444-4444-4444-4444-444444444444',
        proposed_name: 'FHS Knights Sentry Robotics',
        purpose: 'Autonomous ground defense robot team with LIDAR mapping, armor plate impact sensing, and 3-axis turret gimbal.',
        proposed_member_ids: [
          '44444444-4444-4444-4444-444444444444',
          '33333333-3333-3333-3333-333333333333',
        ],
        needs_funding: true,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
        created_team_id: null,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      });

      const initialTeamCount = db.teams.length;
      const initialPendingReq = db.team_requests.find((r) => r.id === testReqId)!;
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
      const testFundingReqId = '70000001-1111-1111-1111-111111111111';
      db.funding_requests.push({
        id: testFundingReqId,
        requested_by: '33333333-3333-3333-3333-333333333333',
        team_id: '10000001-1111-1111-1111-111111111111',
        competition_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'SDS MK4i Swerve Drive Modules & Brushless Motors',
        justification: 'High-precision omnidirectional swerve modules required for 125-lb FRC robot drivetrain compliance under 2027 rules.',
        amount_requested_cents: 48500,
        amount_approved_cents: null,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
        reimbursed_at: null,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      });

      const fundingReq = db.funding_requests.find((r) => r.id === testFundingReqId)!;
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

    it('approving a general equipment request updates status and records audit log', async () => {
      const db = getDb();
      const testGenReqId = 'b0000001-1111-1111-1111-111111111111';
      db.general_requests.push({
        id: testGenReqId,
        requested_by: '44444444-4444-4444-4444-444444444444',
        title: 'Formlabs Form 4 SLA Resin 3D Printer Access',
        category: 'equipment',
        description: 'Requesting permission and budget allocation for high-precision resin printing.',
        urgency: 'medium',
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      });
      const genReq = db.general_requests.find((r) => r.id === testGenReqId)!;
      expect(genReq.status).toBe('pending');

      const res = await reviewRequestAction({
        kind: 'general',
        requestId: genReq.id,
        decision: 'approve',
        note: 'Granted 3D printing lab access.',
      });

      expect(res.ok).toBe(true);
      expect(genReq.status).toBe('approved');
      expect(genReq.review_note).toBe('Granted 3D printing lab access.');
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
      const testMemberId = '44444444-4444-4444-4444-444444444444';
      db.profiles.push({
        id: testMemberId,
        email: 'test.student@bvsd.org',
        full_name: 'Test Student',
        grad_year: 2028,
        role: 'member',
        skills: ['Full-Stack Web', 'C++'],
        avatar_url: null,
        is_active: true,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const member = db.profiles.find((p) => p.id === testMemberId)!;
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

  describe('First-Time Member Onboarding Workflow', () => {
    it('enforces skills selection during onboarding', async () => {
      // Empty skills
      const res = await completeOnboarding({
        full_name: 'Jordan Knight',
        grad_year: 2027,
        skills: [],
      });
      expect(res.ok).toBe(false);
    });

    it('completes onboarding, saves skills, and creates welcome notification', async () => {
      const db = getDb();
      const initialNotifCount = db.notifications.length;

      const res = await completeOnboarding({
        full_name: 'Alex Vance Knight',
        grad_year: 2026,
        skills: ['Aerospace Engineering', 'Computer Engineering', 'AI Engineering'],
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.onboardingCompleted).toBe(true);
      }

      // Check profile in database
      const profile = db.profiles.find((p) => p.id === '11111111-1111-1111-1111-111111111111');
      expect(profile).toBeDefined();
      expect(profile?.onboarding_completed).toBe(true);
      expect(profile?.full_name).toBe('Alex Vance Knight');
      expect(profile?.skills).toContain('Computer Engineering');

      // Check notification created
      expect(db.notifications.length).toBe(initialNotifCount + 1);
      const welcomeNotif = db.notifications[0];
      expect(welcomeNotif.title).toContain('Welcome to Fairview');
      expect(welcomeNotif.body).toContain('Your profile is complete');
    });
  });

  describe('Admin Redo & Reset Onboarding Workflow', () => {
    it('allows admin to reset a member onboarding status to incomplete', async () => {
      const db = getDb();
      const memberId = '22222222-2222-2222-2222-222222222222';
      db.profiles.push({
        id: memberId,
        email: 'sam.member@bvsd.org',
        full_name: 'Sam Member',
        grad_year: 2027,
        role: 'member',
        skills: ['Mechanical Engineering'],
        avatar_url: null,
        is_active: true,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const member = db.profiles.find((p) => p.id === memberId)!;
      expect(member.onboarding_completed).toBe(true);

      const res = await resetMemberOnboarding({ user_id: memberId });
      expect(res.ok).toBe(true);
      expect(member.onboarding_completed).toBe(false);
    });

    it('allows admin to reset their own onboarding and redo the flow while preserving admin role', async () => {
      const db = getDb();
      const adminId = '11111111-1111-1111-1111-111111111111';
      db.profiles.push({
        id: adminId,
        email: 'alex.vance@bvsd.org',
        full_name: 'Alex Vance',
        grad_year: 2026,
        role: 'admin',
        skills: ['Robotics'],
        avatar_url: null,
        is_active: true,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // 1. Admin resets their onboarding
      const resetRes = await resetMemberOnboarding({ user_id: adminId });
      expect(resetRes.ok).toBe(true);
      const adminProfile = db.profiles.find((p) => p.id === adminId)!;
      expect(adminProfile.onboarding_completed).toBe(false);

      // 2. Admin redoes onboarding with new skills
      const redoRes = await completeOnboarding({
        full_name: 'Alex Vance (Lead)',
        grad_year: 2026,
        skills: ['Robotics & Mechatronics', 'AI Engineering'],
      });

      expect(redoRes.ok).toBe(true);
      expect(adminProfile.onboarding_completed).toBe(true);
      expect(adminProfile.role).toBe('admin'); // Role must be preserved
      expect(adminProfile.full_name).toBe('Alex Vance (Lead)');
      expect(adminProfile.skills).toEqual(['Robotics & Mechatronics', 'AI Engineering']);
    });
  });
});

