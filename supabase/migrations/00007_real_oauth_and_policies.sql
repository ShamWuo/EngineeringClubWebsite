-- Migration: 00007_real_oauth_and_policies.sql

-- 1. Public Read Policies for Landing Page and Visitor Discovery
create policy "competitions_select_anon" on competitions for select to anon using (true);
create policy "workshops_select_anon" on workshops for select to anon using (true);
create policy "links_select_anon" on links for select to anon using (true);
create policy "club_settings_select_anon" on club_settings for select to anon using (true);

-- 2. Improved Auth Trigger for Google OAuth metadata extraction
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_count int;
  v_initial_role user_role := 'member';
  v_name text;
  v_avatar text;
begin
  -- Check if this is the very first user (they become admin)
  select count(*) into v_count from profiles;
  if v_count = 0 then
    v_initial_role := 'admin';
  end if;

  v_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'user_name',
    split_part(new.email, '@', 1)
  );

  v_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );

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
    v_name,
    (new.raw_user_meta_data->>'grad_year')::int,
    v_initial_role,
    '{}',
    v_avatar,
    true
  ) on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    avatar_url = coalesce(profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

-- Drop and recreate auth trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Update decide_request RPC to support 'general' requests
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
  elsif p_kind = 'general' then
    select requested_by, title into v_user_id, v_title from general_requests where id = p_request_id;
    update general_requests set status = p_new_status::request_status, reviewed_by = p_reviewer_id, reviewed_at = now(), review_note = p_note, updated_at = now() where id = p_request_id;
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
    '/requests'
  );

  -- Audit log
  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_reviewer_id, format('decide_%s_request', p_kind), p_kind || '_requests', p_request_id, jsonb_build_object('status', p_new_status, 'note', p_note));

  return true;
end;
$$;
