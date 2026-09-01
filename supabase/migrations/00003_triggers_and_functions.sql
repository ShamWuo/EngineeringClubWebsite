-- Migration: 00003_triggers_and_functions.sql
-- Description: Trigger guards, audit triggers, and atomic approval RPCs.

-- 1. Auto-create Profile on Auth Signup Trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_count int;
  v_initial_role user_role := 'member';
begin
  -- First user becomes admin automatically
  select count(*) into v_count from profiles;
  if v_count = 0 then
    v_initial_role := 'admin';
  end if;

  insert into profiles (
    id,
    email,
    full_name,
    grad_year,
    role,
    skills,
    avatar_url,
    is_active
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    (new.raw_user_meta_data->>'grad_year')::int,
    v_initial_role,
    '{}',
    new.raw_user_meta_data->>'avatar_url',
    true
  );

  return new;
end;
$$;

-- Drop and recreate auth trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Prevent Unauthorized Role Escalation
create or replace function public.prevent_unauthorized_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    if not is_admin() then
      raise exception 'Unauthorized: Only club administrators can change user roles.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_role_guard
  before update on profiles
  for each row execute function public.prevent_unauthorized_role_change();

-- 3. Prevent Unauthorized Status Forgery
create or replace function public.prevent_unauthorized_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.status is distinct from old.status) or
     (new.review_note is distinct from old.review_note) or
     (new.reviewed_by is distinct from old.reviewed_by) then
    
    if not is_officer() then
      -- Non-officers can only transition from pending -> withdrawn
      if new.status = 'withdrawn' and old.status = 'pending' and new.requested_by = auth.uid() then
        return new;
      else
        raise exception 'Unauthorized: Only club officers can review or update request statuses.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_team_req_status_guard
  before update on team_requests
  for each row execute function public.prevent_unauthorized_status_change();

create trigger trg_comp_req_status_guard
  before update on competition_requests
  for each row execute function public.prevent_unauthorized_status_change();

create trigger trg_workshop_req_status_guard
  before update on workshop_requests
  for each row execute function public.prevent_unauthorized_status_change();

create trigger trg_funding_req_status_guard
  before update on funding_requests
  for each row execute function public.prevent_unauthorized_status_change();

-- 4. Primary Links Cap (Max 4 active primary links)
create or replace function public.enforce_primary_links_cap()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  if new.tier = 'primary' and new.is_active = true then
    select count(*) into v_count from links
    where tier = 'primary' and is_active = true and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if v_count >= 4 then
      raise exception 'Constraint violation: A maximum of 4 primary links are allowed at one time.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_links_primary_cap
  before insert or update on links
  for each row execute function public.enforce_primary_links_cap();

-- 5. Atomic Approval RPC: Team Request
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

  -- Create team
  insert into teams (
    competition_id,
    name,
    description,
    is_recruiting,
    created_by
  ) values (
    v_req.competition_id,
    v_req.proposed_name,
    v_req.purpose,
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
  );

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
    'Team Request Approved! 🎉',
    format('Your team "%s" has been approved and created.', v_req.proposed_name),
    format('/teams/%s', v_team_id)
  );

  -- Audit log
  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_reviewer_id, 'approve_team_request', 'team_requests', p_request_id, jsonb_build_object('created_team_id', v_team_id, 'note', p_note));

  return v_team_id;
end;
$$;

-- 6. Atomic Approval RPC: Competition Request
create or replace function public.approve_competition_request(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_note text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_req record;
  v_comp_id uuid;
  v_slug text;
begin
  if not is_officer() then
    raise exception 'Unauthorized: Only officers can approve competition requests.';
  end if;

  select * into v_req from competition_requests where id = p_request_id for update;
  if not found then
    raise exception 'Competition request not found.';
  end if;

  -- Generate slug
  v_slug := lower(regexp_replace(v_req.name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug) || '-' || substr(md5(random()::text), 1, 4);

  -- Create competition
  insert into competitions (
    slug,
    name,
    description,
    organizer,
    status,
    external_url,
    created_by
  ) values (
    v_slug,
    v_req.name,
    v_req.why,
    v_req.organizer,
    'planned',
    v_req.url,
    v_req.requested_by
  ) returning id into v_comp_id;

  -- Update request record
  update competition_requests
  set status = 'approved',
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      review_note = p_note,
      created_competition_id = v_comp_id,
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
    'competition_approved',
    'Competition Request Approved! 🚀',
    format('Your proposal for "%s" has been approved.', v_req.name),
    format('/competitions/%s', v_slug)
  );

  -- Audit log
  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_reviewer_id, 'approve_competition_request', 'competition_requests', p_request_id, jsonb_build_object('created_competition_id', v_comp_id, 'note', p_note));

  return v_comp_id;
end;
$$;

-- 7. Atomic Approval RPC: Workshop Request
create or replace function public.approve_workshop_request(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_note text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_req record;
  v_workshop_id uuid;
  v_slug text;
begin
  if not is_officer() then
    raise exception 'Unauthorized: Only officers can approve workshop requests.';
  end if;

  select * into v_req from workshop_requests where id = p_request_id for update;
  if not found then
    raise exception 'Workshop request not found.';
  end if;

  -- Generate slug
  v_slug := lower(regexp_replace(v_req.topic, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug) || '-' || substr(md5(random()::text), 1, 4);

  -- Create workshop
  insert into workshops (
    slug,
    title,
    description,
    instructor_id,
    status,
    created_by
  ) values (
    v_slug,
    v_req.topic,
    v_req.rationale,
    case when v_req.offering_to_teach then v_req.requested_by else null end,
    'scheduled',
    v_req.requested_by
  ) returning id into v_workshop_id;

  -- Update request record
  update workshop_requests
  set status = 'approved',
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      review_note = p_note,
      created_workshop_id = v_workshop_id,
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
    'workshop_approved',
    'Workshop Request Approved! 💡',
    format('Your workshop proposal on "%s" has been scheduled.', v_req.topic),
    format('/workshops/%s', v_slug)
  );

  -- Audit log
  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_reviewer_id, 'approve_workshop_request', 'workshop_requests', p_request_id, jsonb_build_object('created_workshop_id', v_workshop_id, 'note', p_note));

  return v_workshop_id;
end;
$$;

-- 8. Atomic Approval RPC: Funding Request
create or replace function public.approve_funding_request(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_approved_cents int,
  p_note text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_req record;
  v_new_status funding_status;
begin
  if not is_officer() then
    raise exception 'Unauthorized: Only officers can approve funding requests.';
  end if;

  select * into v_req from funding_requests where id = p_request_id for update;
  if not found then
    raise exception 'Funding request not found.';
  end if;

  if p_approved_cents < v_req.amount_requested_cents then
    v_new_status := 'partially_approved';
  else
    v_new_status := 'approved';
  end if;

  update funding_requests
  set status = v_new_status,
      amount_approved_cents = p_approved_cents,
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      review_note = p_note,
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
    'funding_approved',
    'Funding Request Approved! 💰',
    format('Your funding request "%s" was %s ($%s approved).', v_req.title, replace(v_new_status::text, '_', ' '), (p_approved_cents / 100.0)::numeric(10,2)),
    '/funding'
  );

  -- Audit log
  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_reviewer_id, 'approve_funding_request', 'funding_requests', p_request_id, jsonb_build_object('amount_approved_cents', p_approved_cents, 'status', v_new_status, 'note', p_note));

  return p_request_id;
end;
$$;

-- 9. Generic Request Decision RPC (Reject / Request Changes)
create or replace function public.decide_request(
  p_kind text,
  p_request_id uuid,
  p_reviewer_id uuid,
  p_new_status text,
  p_note text default null
)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
  v_title text;
begin
  if not is_officer() then
    raise exception 'Unauthorized: Only officers can review requests.';
  end if;

  if p_kind = 'team' then
    select requested_by, proposed_name into v_user_id, v_title from team_requests where id = p_request_id;
    update team_requests set status = p_new_status::request_status, reviewed_by = p_reviewer_id, reviewed_at = now(), review_note = p_note, updated_at = now() where id = p_request_id;
  elsif p_kind = 'competition' then
    select requested_by, name into v_user_id, v_title from competition_requests where id = p_request_id;
    update competition_requests set status = p_new_status::request_status, reviewed_by = p_reviewer_id, reviewed_at = now(), review_note = p_note, updated_at = now() where id = p_request_id;
  elsif p_kind = 'workshop' then
    select requested_by, topic into v_user_id, v_title from workshop_requests where id = p_request_id;
    update workshop_requests set status = p_new_status::request_status, reviewed_by = p_reviewer_id, reviewed_at = now(), review_note = p_note, updated_at = now() where id = p_request_id;
  elsif p_kind = 'funding' then
    select requested_by, title into v_user_id, v_title from funding_requests where id = p_request_id;
    update funding_requests set status = p_new_status::funding_status, reviewed_by = p_reviewer_id, reviewed_at = now(), review_note = p_note, updated_at = now() where id = p_request_id;
  else
    raise exception 'Invalid request kind: %', p_kind;
  end if;

  -- Notify user
  insert into notifications (
    user_id,
    kind,
    title,
    body,
    href
  ) values (
    v_user_id,
    'request_decision',
    format('Request Update: %s', replace(p_new_status, '_', ' ')),
    format('Your %s request "%s" status was updated to %s. Note: %s', p_kind, v_title, replace(p_new_status, '_', ' '), coalesce(p_note, 'No note provided')),
    case when p_kind = 'funding' then '/funding' else '/dashboard' end
  );

  -- Audit log
  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_reviewer_id, format('decide_%s_request', p_kind), p_kind || '_requests', p_request_id, jsonb_build_object('status', p_new_status, 'note', p_note));

  return true;
end;
$$;
