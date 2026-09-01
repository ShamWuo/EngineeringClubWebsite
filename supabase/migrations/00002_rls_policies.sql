-- Migration: 00002_rls_policies.sql
-- Description: Security functions and Row Level Security policies for all tables.

-- 1. Helper Functions
create or replace function auth_user_role() returns user_role language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where id = auth.uid()), 'member'::user_role);
$$;

create or replace function is_officer() returns boolean language sql stable security definer set search_path = public as $$
  select auth_user_role() in ('officer', 'admin');
$$;

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select auth_user_role() = 'admin';
$$;

create or replace function is_team_member(t uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid());
$$;

create or replace function is_team_lead(t uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid() and role = 'lead');
$$;

-- 2. Enable RLS on all tables
alter table profiles enable row level security;
alter table competitions enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table competition_signups enable row level security;
alter table team_requests enable row level security;
alter table competition_requests enable row level security;
alter table workshops enable row level security;
alter table workshop_rsvps enable row level security;
alter table workshop_requests enable row level security;
alter table workshop_request_votes enable row level security;
alter table funding_requests enable row level security;
alter table funding_line_items enable row level security;
alter table funding_attachments enable row level security;
alter table work_logs enable row level security;
alter table links enable row level security;
alter table notifications enable row level security;
alter table audit_log enable row level security;
alter table club_settings enable row level security;

-- 3. Profiles Policies
create policy "profiles_select" on profiles for select to authenticated using (true);
create policy "profiles_update_self" on profiles for update to authenticated using (id = auth.uid() or is_admin());
create policy "profiles_delete_admin" on profiles for delete to authenticated using (is_admin());

-- 4. Competitions Policies
create policy "competitions_select" on competitions for select to authenticated using (true);
create policy "competitions_insert_officer" on competitions for insert to authenticated with check (is_officer());
create policy "competitions_update_officer" on competitions for update to authenticated using (is_officer());
create policy "competitions_delete_admin" on competitions for delete to authenticated using (is_admin());

-- 5. Teams Policies
create policy "teams_select" on teams for select to authenticated using (true);
create policy "teams_insert_officer" on teams for insert to authenticated with check (is_officer());
create policy "teams_update_lead_or_officer" on teams for update to authenticated using (is_team_lead(id) or is_officer());
create policy "teams_delete_officer" on teams for delete to authenticated using (is_officer());

-- 6. Team Members Policies
create policy "team_members_select" on team_members for select to authenticated using (true);
create policy "team_members_insert" on team_members for insert to authenticated with check (is_team_lead(team_id) or is_officer());
create policy "team_members_update_officer" on team_members for update to authenticated using (is_officer());
create policy "team_members_delete" on team_members for delete to authenticated using (user_id = auth.uid() or is_team_lead(team_id) or is_officer());

-- 7. Competition Signups Policies
create policy "competition_signups_select" on competition_signups for select to authenticated using (user_id = auth.uid() or is_officer());
create policy "competition_signups_insert_self" on competition_signups for insert to authenticated with check (user_id = auth.uid());
create policy "competition_signups_update" on competition_signups for update to authenticated using ((user_id = auth.uid() and status = 'pending') or is_officer());
create policy "competition_signups_delete" on competition_signups for delete to authenticated using (user_id = auth.uid() and status = 'pending');

-- 8. Team Requests Policies
create policy "team_requests_select" on team_requests for select to authenticated using (requested_by = auth.uid() or is_officer());
create policy "team_requests_insert_self" on team_requests for insert to authenticated with check (requested_by = auth.uid());
create policy "team_requests_update" on team_requests for update to authenticated using ((requested_by = auth.uid() and status = 'pending') or is_officer());

-- 9. Competition Requests Policies
create policy "competition_requests_select" on competition_requests for select to authenticated using (requested_by = auth.uid() or is_officer());
create policy "competition_requests_insert_self" on competition_requests for insert to authenticated with check (requested_by = auth.uid());
create policy "competition_requests_update" on competition_requests for update to authenticated using ((requested_by = auth.uid() and status = 'pending') or is_officer());

-- 10. Workshops Policies
create policy "workshops_select" on workshops for select to authenticated using (true);
create policy "workshops_insert_officer" on workshops for insert to authenticated with check (is_officer());
create policy "workshops_update_officer_or_instructor" on workshops for update to authenticated using (is_officer() or instructor_id = auth.uid());
create policy "workshops_delete_officer" on workshops for delete to authenticated using (is_officer());

-- 11. Workshop RSVPs Policies
create policy "workshop_rsvps_select" on workshop_rsvps for select to authenticated using (true);
create policy "workshop_rsvps_insert_self" on workshop_rsvps for insert to authenticated with check (user_id = auth.uid());
create policy "workshop_rsvps_update" on workshop_rsvps for update to authenticated using (user_id = auth.uid() or is_officer());
create policy "workshop_rsvps_delete" on workshop_rsvps for delete to authenticated using (user_id = auth.uid() or is_officer());

-- 12. Workshop Requests Policies
create policy "workshop_requests_select" on workshop_requests for select to authenticated using (true);
create policy "workshop_requests_insert_self" on workshop_requests for insert to authenticated with check (requested_by = auth.uid());
create policy "workshop_requests_update" on workshop_requests for update to authenticated using ((requested_by = auth.uid() and status = 'pending') or is_officer());

-- 13. Workshop Request Votes Policies
create policy "workshop_votes_select" on workshop_request_votes for select to authenticated using (true);
create policy "workshop_votes_insert_self" on workshop_request_votes for insert to authenticated with check (user_id = auth.uid());
create policy "workshop_votes_delete_self" on workshop_request_votes for delete to authenticated using (user_id = auth.uid());

-- 14. Funding Requests Policies
create policy "funding_requests_select" on funding_requests for select to authenticated using (
  requested_by = auth.uid()
  or (team_id is not null and is_team_member(team_id))
  or is_officer()
);
create policy "funding_requests_insert_self" on funding_requests for insert to authenticated with check (requested_by = auth.uid());
create policy "funding_requests_update" on funding_requests for update to authenticated using (
  (requested_by = auth.uid() and status = 'pending') or is_officer()
);

-- 15. Funding Line Items Policies
create policy "funding_line_items_select" on funding_line_items for select to authenticated using (
  exists (
    select 1 from funding_requests fr
    where fr.id = funding_line_items.funding_request_id
    and (fr.requested_by = auth.uid() or (fr.team_id is not null and is_team_member(fr.team_id)) or is_officer())
  )
);
create policy "funding_line_items_write" on funding_line_items for all to authenticated using (
  exists (
    select 1 from funding_requests fr
    where fr.id = funding_line_items.funding_request_id
    and ((fr.requested_by = auth.uid() and fr.status = 'pending') or is_officer())
  )
);

-- 16. Funding Attachments Policies
create policy "funding_attachments_select" on funding_attachments for select to authenticated using (
  exists (
    select 1 from funding_requests fr
    where fr.id = funding_attachments.funding_request_id
    and (fr.requested_by = auth.uid() or (fr.team_id is not null and is_team_member(fr.team_id)) or is_officer())
  )
);
create policy "funding_attachments_insert" on funding_attachments for insert to authenticated with check (
  uploaded_by = auth.uid()
);
create policy "funding_attachments_delete" on funding_attachments for delete to authenticated using (
  uploaded_by = auth.uid() or is_officer()
);

-- 17. Work Logs Policies
create policy "work_logs_select" on work_logs for select to authenticated using (
  author_id = auth.uid()
  or visibility = 'club'
  or is_officer()
  or (team_id is not null and is_team_member(team_id))
);
create policy "work_logs_insert_self" on work_logs for insert to authenticated with check (author_id = auth.uid());
create policy "work_logs_update_self" on work_logs for update to authenticated using (author_id = auth.uid());
create policy "work_logs_delete" on work_logs for delete to authenticated using (author_id = auth.uid() or is_officer());

-- 18. Links Policies
create policy "links_select" on links for select to authenticated using (true);
create policy "links_insert_officer" on links for insert to authenticated with check (is_officer());
create policy "links_update_officer" on links for update to authenticated using (is_officer());
create policy "links_delete_officer" on links for delete to authenticated using (is_officer());

-- 19. Notifications Policies
create policy "notifications_select_self" on notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_update_self" on notifications for update to authenticated using (user_id = auth.uid());
create policy "notifications_delete_self" on notifications for delete to authenticated using (user_id = auth.uid());

-- 20. Audit Log Policies
create policy "audit_log_select_officer" on audit_log for select to authenticated using (is_officer());

-- 21. Club Settings Policies
create policy "club_settings_select" on club_settings for select to authenticated using (true);
create policy "club_settings_update_admin" on club_settings for update to authenticated using (is_admin());
