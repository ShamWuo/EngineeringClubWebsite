-- Migration 00010: Direct team creation policies and verification updates
-- Allows authenticated members to create teams directly and add initial members,
-- and updates approve_team_request RPC to verify existing created teams.

-- 1. Allow authenticated members to insert teams
drop policy if exists "teams_insert_officer" on teams;
drop policy if exists "teams_insert_authenticated" on teams;
create policy "teams_insert_authenticated" on teams
  for insert to authenticated
  with check (created_by = auth.uid() or is_officer());

-- 2. Allow creators and team leads to insert team members
drop policy if exists "team_members_insert" on team_members;
create policy "team_members_insert" on team_members
  for insert to authenticated
  with check (
    is_team_lead(team_id)
    or is_officer()
    or exists (select 1 from teams where id = team_id and created_by = auth.uid())
  );

-- 3. Update approve_team_request RPC to handle verifying pre-created teams
create or replace function public.approve_team_request(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_note text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_req record;
  v_team_id uuid;
  v_member_id uuid;
begin
  if not is_officer() then
    raise exception 'Unauthorized: Only officers can approve team requests.';
  end if;

  select * into v_req from team_requests where id = p_request_id for update;
  if not found then
    raise exception 'Team request not found.';
  end if;

  if v_req.status != 'pending' and v_req.status != 'changes_requested' then
    raise exception 'Request has already been processed.';
  end if;

  -- If team was already created straight up, verify it
  if v_req.created_team_id is not null then
    v_team_id := v_req.created_team_id;
    update teams
    set is_verified = true,
        updated_at = now()
    where id = v_team_id;
  else
    -- Fallback for legacy proposals: insert team
    insert into teams (
      competition_id,
      name,
      description,
      is_recruiting,
      is_verified,
      created_by
    ) values (
      v_req.competition_id,
      v_req.proposed_name,
      v_req.purpose,
      true,
      true,
      v_req.requested_by
    ) returning id into v_team_id;

    -- Add requester as team lead
    insert into team_members (
      team_id,
      user_id,
      role
    ) values (
      v_team_id,
      v_req.requested_by,
      'lead'
    ) on conflict (team_id, user_id) do nothing;

    -- Add proposed members if provided
    if v_req.proposed_member_ids is not null then
      foreach v_member_id in array v_req.proposed_member_ids loop
        if v_member_id != v_req.requested_by then
          insert into team_members (team_id, user_id, role)
          values (v_team_id, v_member_id, 'member')
          on conflict (team_id, user_id) do nothing;
        end if;
      end loop;
    end if;
  end if;

  -- Auto-approve any pending competition signup for requester
  update competition_signups
  set status = 'approved'
  where competition_id = v_req.competition_id and user_id = v_req.requested_by;

  -- Update request record
  update team_requests
  set status = 'approved',
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      review_note = p_note,
      created_team_id = v_team_id,
      updated_at = now()
  where id = p_request_id;

  -- Notify requester
  insert into notifications (
    user_id,
    kind,
    title,
    body,
    href
  ) values (
    v_req.requested_by,
    'team_approved',
    'Team Verified! 🎉',
    format('Your team "%s" has been officially verified by officers.', v_req.proposed_name),
    format('/teams/%s', v_team_id)
  );

  -- Audit log
  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_reviewer_id, 'approve_team_request', 'team_requests', p_request_id, jsonb_build_object('created_team_id', v_team_id, 'note', p_note));

  return v_team_id;
end;
$$;
