import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/db/types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type CompetitionRow = Database['public']['Tables']['competitions']['Row'];
export type TeamRow = Database['public']['Tables']['teams']['Row'];
export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
export type WorkshopRow = Database['public']['Tables']['workshops']['Row'];
export type WorkshopRsvpRow = Database['public']['Tables']['workshop_rsvps']['Row'];
export type LinkRow = Database['public']['Tables']['links']['Row'];
export type ClubSettingsRow = Database['public']['Tables']['club_settings']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type GeneralRequestRow = Database['public']['Tables']['general_requests']['Row'];
export type TeamRequestRow = Database['public']['Tables']['team_requests']['Row'];
export type CompetitionRequestRow = Database['public']['Tables']['competition_requests']['Row'];
export type WorkshopRequestRow = Database['public']['Tables']['workshop_requests']['Row'];
export type FundingRequestRow = Database['public']['Tables']['funding_requests']['Row'];
export type FundingLineItemRow = Database['public']['Tables']['funding_line_items']['Row'];
export type FundingAttachmentRow = Database['public']['Tables']['funding_attachments']['Row'];

// 1. Club Settings
export async function getClubSettings(): Promise<ClubSettingsRow> {
  const supabase = await createClient();
  const { data } = await (supabase.from('club_settings') as any)
    .select('*')
    .eq('id', 'default')
    .single();

  if (data) return data;

  return {
    id: 'default',
    club_name: 'Fairview High School Engineering Club',
    allowed_email_domain: 'bvsd.org',
    budget_ceiling_cents: 5000000,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };
}

// 2. Competitions
export async function getCompetitions(): Promise<CompetitionRow[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('competitions') as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching competitions:', error);
    return [];
  }
  return data;
}

export async function getCompetitionBySlug(slug: string): Promise<{ comp: CompetitionRow; teams: any[] } | null> {
  const supabase = await createClient();
  const { data: comp } = await (supabase.from('competitions') as any)
    .select('*')
    .eq('slug', slug)
    .single();

  if (!comp) return null;

  const { data: teams } = await (supabase.from('teams') as any)
    .select('*, team_members(*)')
    .eq('competition_id', (comp as CompetitionRow).id);

  return {
    comp: comp as CompetitionRow,
    teams: teams || [],
  };
}

// 3. Workshops
export async function getWorkshops(): Promise<WorkshopRow[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('workshops') as any)
    .select('*')
    .order('starts_at', { ascending: true });

  if (error || !data) {
    console.error('Error fetching workshops:', error);
    return [];
  }
  return data;
}

export async function getWorkshopBySlug(slug: string): Promise<{ workshop: WorkshopRow; rsvps: any[] } | null> {
  const supabase = await createClient();
  const { data: workshop } = await (supabase.from('workshops') as any)
    .select('*')
    .eq('slug', slug)
    .single();

  if (!workshop) return null;

  const { data: rsvps } = await (supabase.from('workshop_rsvps') as any)
    .select('*')
    .eq('workshop_id', (workshop as WorkshopRow).id);

  return {
    workshop: workshop as WorkshopRow,
    rsvps: rsvps || [],
  };
}

// 4. Teams & Rosters
export async function getTeams(): Promise<(TeamRow & { competition?: CompetitionRow | null; memberCount: number })[]> {
  const supabase = await createClient();
  const { data: teams } = await (supabase.from('teams') as any)
    .select('*, competitions(*), team_members(user_id)');

  if (!teams) return [];

  return teams.map((t: any) => ({
    ...t,
    competition: t.competitions,
    memberCount: t.team_members?.length || 0,
  }));
}

export async function getTeamById(id: string): Promise<{ team: TeamRow; competition: CompetitionRow | null; members: any[]; funding: any[] } | null> {
  const supabase = await createClient();
  const { data: team } = await (supabase.from('teams') as any)
    .select('*, competitions(*)')
    .eq('id', id)
    .single();

  if (!team) return null;

  const { data: members } = await (supabase.from('team_members') as any)
    .select('*, profiles(*)')
    .eq('team_id', id);

  const { data: funding } = await (supabase.from('funding_requests') as any)
    .select('*')
    .eq('team_id', id);

  return {
    team,
    competition: (team as any).competitions as CompetitionRow | null,
    members: members || [],
    funding: funding || [],
  };
}

// 5. Links Directory
export async function getLinks(): Promise<LinkRow[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('links') as any)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) {
    console.error('Error fetching links:', error);
    return [];
  }
  return data;
}

// 6. User Notifications
export async function getNotifications(userId: string): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('notifications') as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

// 7. Member Dashboard Queries
export async function getMemberDashboardData(userId: string) {
  const supabase = await createClient();

  const [
    { data: teamMemberships },
    { data: competitions },
    { data: workshops },
    { data: userRsvps },
    { data: links },
    { data: teamReqs },
    { data: compReqs },
    { data: workshopReqs },
    { data: fundingReqs },
    { data: genReqs },
  ] = await Promise.all([
    (supabase.from('team_members') as any)
      .select('*, teams(*, competitions(*))')
      .eq('user_id', userId),
    (supabase.from('competitions') as any)
      .select('*')
      .order('created_at', { ascending: false }),
    (supabase.from('workshops') as any)
      .select('*')
      .order('starts_at', { ascending: true }),
    (supabase.from('workshop_rsvps') as any)
      .select('*')
      .eq('user_id', userId),
    (supabase.from('links') as any)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    (supabase.from('team_requests') as any)
      .select('*')
      .eq('requested_by', userId),
    (supabase.from('competition_requests') as any)
      .select('*')
      .eq('requested_by', userId),
    (supabase.from('workshop_requests') as any)
      .select('*')
      .eq('requested_by', userId),
    (supabase.from('funding_requests') as any)
      .select('*')
      .eq('requested_by', userId),
    (supabase.from('general_requests') as any)
      .select('*')
      .eq('requested_by', userId),
  ]);

  const teams = (teamMemberships || []).map((m: any) => ({
    team: m.teams,
    comp: m.teams?.competitions,
    role: m.role,
  }));

  const allRequests = [
    ...(teamReqs || []).map((r: any) => ({ kind: 'team', id: r.id, title: r.proposed_name, status: r.status, date: r.created_at })),
    ...(compReqs || []).map((r: any) => ({ kind: 'competition', id: r.id, title: r.name, status: r.status, date: r.created_at })),
    ...(workshopReqs || []).map((r: any) => ({ kind: 'workshop', id: r.id, title: r.topic, status: r.status, date: r.created_at })),
    ...(fundingReqs || []).map((r: any) => ({ kind: 'funding', id: r.id, title: r.title, status: r.status, date: r.created_at })),
    ...(genReqs || []).map((r: any) => ({ kind: 'general', id: r.id, title: r.title, status: r.status, date: r.created_at })),
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    teams,
    competitions: competitions || [],
    workshops: workshops || [],
    userRsvps: new Set((userRsvps || []).map((r: any) => r.workshop_id)),
    primaryLinks: (links || []).filter((l: any) => l.tier === 'primary'),
    allRequests,
  };
}

// 8. User Requests Page
export async function getUserRequestsData(userId: string) {
  const supabase = await createClient();

  const [
    { data: compReqs },
    { data: teamReqs },
    { data: workshopReqs },
    { data: fundingReqs },
    { data: genReqs },
  ] = await Promise.all([
    (supabase.from('competition_requests') as any)
      .select('*')
      .eq('requested_by', userId),
    (supabase.from('team_requests') as any)
      .select('*, competitions(name)')
      .eq('requested_by', userId),
    (supabase.from('workshop_requests') as any)
      .select('*')
      .eq('requested_by', userId),
    (supabase.from('funding_requests') as any)
      .select('*')
      .eq('requested_by', userId),
    (supabase.from('general_requests') as any)
      .select('*')
      .eq('requested_by', userId),
  ]);

  const items = [
    ...(compReqs || []).map((r: any) => ({
      id: r.id,
      kind: 'competition' as const,
      title: r.name,
      subtitle: r.organizer || 'External Competition',
      summary: r.why,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    })),
    ...(teamReqs || []).map((r: any) => ({
      id: r.id,
      kind: 'team' as const,
      title: r.proposed_name,
      subtitle: r.competitions?.name || 'Competition Team',
      summary: r.purpose,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    })),
    ...(workshopReqs || []).map((r: any) => ({
      id: r.id,
      kind: 'workshop' as const,
      title: r.topic,
      subtitle: r.offering_to_teach ? 'Offering to teach' : 'Topic suggestion',
      summary: r.rationale,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    })),
    ...(fundingReqs || []).map((r: any) => ({
      id: r.id,
      kind: 'funding' as const,
      title: r.title,
      subtitle: `$${(r.amount_requested_cents / 100).toFixed(2)} requested`,
      summary: r.justification,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    })),
    ...(genReqs || []).map((r: any) => ({
      id: r.id,
      kind: 'general' as const,
      title: r.title,
      subtitle: `Category: ${r.category} • Urgency: ${r.urgency}`,
      summary: r.description,
      status: r.status,
      reviewNote: r.review_note,
      createdAt: r.created_at,
    })),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return items;
}

// 9. Officer Review Queue
export async function getOfficerReviewQueue() {
  const supabase = await createClient();

  const [
    { data: teamReqs },
    { data: compReqs },
    { data: workshopReqs },
    { data: fundingReqs },
    { data: genReqs },
    { data: profiles },
  ] = await Promise.all([
    (supabase.from('team_requests') as any).select('*'),
    (supabase.from('competition_requests') as any).select('*'),
    (supabase.from('workshop_requests') as any).select('*'),
    (supabase.from('funding_requests') as any).select('*'),
    (supabase.from('general_requests') as any).select('*'),
    (supabase.from('profiles') as any).select('id, full_name, email'),
  ]);

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  const teams = (teamReqs || []).map((r: any) => ({
    ...r,
    kind: 'team' as const,
    title: r.proposed_name,
    summary: r.purpose,
    amountCents: undefined,
    requester: profileMap.get(r.requested_by),
  }));

  const comps = (compReqs || []).map((r: any) => ({
    ...r,
    kind: 'competition' as const,
    title: r.name,
    summary: r.why,
    amountCents: r.estimated_cost_cents,
    requester: profileMap.get(r.requested_by),
  }));

  const workshops = (workshopReqs || []).map((r: any) => ({
    ...r,
    kind: 'workshop' as const,
    title: r.topic,
    summary: r.rationale,
    amountCents: undefined,
    requester: profileMap.get(r.requested_by),
  }));

  const fundings = (fundingReqs || []).map((r: any) => ({
    ...r,
    kind: 'funding' as const,
    title: r.title,
    summary: r.justification,
    amountCents: r.amount_requested_cents,
    requester: profileMap.get(r.requested_by),
  }));

  const generals = (genReqs || []).map((r: any) => ({
    ...r,
    kind: 'general' as const,
    title: r.title,
    summary: `[Category: ${r.category} | Urgency: ${r.urgency}] ${r.description}`,
    amountCents: undefined,
    requester: profileMap.get(r.requested_by),
  }));

  const allRequests = [...teams, ...comps, ...workshops, ...fundings, ...generals];

  return {
    allRequests,
    counts: {
      team: teams.filter((r: any) => r.status === 'pending').length,
      competition: comps.filter((r: any) => r.status === 'pending').length,
      workshop: workshops.filter((r: any) => r.status === 'pending').length,
      funding: fundings.filter((r: any) => r.status === 'pending').length,
      general: generals.filter((r: any) => r.status === 'pending').length,
      total: allRequests.filter((r: any) => r.status === 'pending').length,
    },
  };
}

// 10. Officer Review Detail
export async function getReviewDetail(kind: string, id: string) {
  const supabase = await createClient();

  let requestData: any = null;

  if (kind === 'team') {
    const { data } = await (supabase.from('team_requests') as any).select('*').eq('id', id).single();
    requestData = data;
  } else if (kind === 'competition') {
    const { data } = await (supabase.from('competition_requests') as any).select('*').eq('id', id).single();
    requestData = data;
  } else if (kind === 'workshop') {
    const { data } = await (supabase.from('workshop_requests') as any).select('*').eq('id', id).single();
    requestData = data;
  } else if (kind === 'funding') {
    const { data } = await (supabase.from('funding_requests') as any).select('*').eq('id', id).single();
    requestData = data;
  } else if (kind === 'general') {
    const { data } = await (supabase.from('general_requests') as any).select('*').eq('id', id).single();
    requestData = data;
  }

  if (!requestData) return null;

  // Requester profile
  const { data: requester } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', requestData.requested_by)
    .single();

  // Supplementary data
  let comp: CompetitionRow | null = null;
  let lineItems: FundingLineItemRow[] = [];
  let attachments: FundingAttachmentRow[] = [];
  let proposedMembers: ProfileRow[] = [];

  if (kind === 'team' && requestData.competition_id) {
    const { data } = await (supabase.from('competitions') as any).select('*').eq('id', requestData.competition_id).single();
    comp = data;
  }

  if (kind === 'team' && requestData.proposed_member_ids?.length) {
    const { data } = await (supabase.from('profiles') as any).select('*').in('id', requestData.proposed_member_ids);
    proposedMembers = data || [];
  }

  if (kind === 'funding') {
    const [{ data: items }, { data: files }] = await Promise.all([
      (supabase.from('funding_line_items') as any).select('*').eq('funding_request_id', id),
      (supabase.from('funding_attachments') as any).select('*').eq('funding_request_id', id),
    ]);
    lineItems = items || [];
    attachments = files || [];
  }

  return {
    requestData,
    requester,
    comp,
    lineItems,
    attachments,
    proposedMembers,
  };
}

// 11. Admin Profiles
export async function getAdminProfiles(): Promise<ProfileRow[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('profiles') as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}
