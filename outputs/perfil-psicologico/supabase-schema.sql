create extension if not exists pgcrypto;

create table if not exists public.profile_tokens (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  code_hint text not null,
  status text not null default 'active' check (status in ('active', 'used', 'revoked')),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create table if not exists public.profile_token_batches (
  id uuid primary key default gen_random_uuid(),
  recipient_name text not null,
  company text not null,
  quantity integer not null check (quantity between 1 and 100),
  created_at timestamptz not null default now()
);

alter table public.profile_tokens
  add column if not exists batch_id uuid references public.profile_token_batches(id);

create table if not exists public.profile_submissions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null unique references public.profile_tokens(id),
  name text not null,
  email text not null,
  phone text not null,
  company text not null,
  job_title text not null,
  profile jsonb not null default '{}'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now()
);

alter table public.profile_submissions
  add column if not exists report_html text;

alter table public.profile_submissions
  add column if not exists ai_consent boolean not null default false,
  add column if not exists ai_text jsonb,
  add column if not exists ai_claimed_at timestamptz,
  add column if not exists ai_attempts integer not null default 0,
  add column if not exists ai_archived_at timestamptz;

create table if not exists public.profile_ai_usage (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  model text not null,
  outcome text not null check (outcome in ('completed', 'failed', 'unknown')),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  total_tokens integer check (total_tokens >= 0),
  cached_input_tokens integer check (cached_input_tokens >= 0),
  reasoning_output_tokens integer check (reasoning_output_tokens >= 0)
);

create index if not exists profile_ai_usage_created_at_idx
  on public.profile_ai_usage (created_at desc);

alter table public.profile_tokens enable row level security;
alter table public.profile_token_batches enable row level security;
alter table public.profile_submissions enable row level security;
alter table public.profile_ai_usage enable row level security;
revoke all on public.profile_ai_usage from anon, authenticated;
grant select on public.profile_ai_usage to authenticated;
grant insert on public.profile_ai_usage to service_role;

drop policy if exists "admin manages tokens" on public.profile_tokens;
create policy "admin manages tokens" on public.profile_tokens for all to authenticated
  using ((auth.jwt() ->> 'email') = 'rodrigomelo1912@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'rodrigomelo1912@gmail.com');

drop policy if exists "admin manages token batches" on public.profile_token_batches;
create policy "admin manages token batches" on public.profile_token_batches for all to authenticated
  using ((auth.jwt() ->> 'email') = 'rodrigomelo1912@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'rodrigomelo1912@gmail.com');

drop policy if exists "admin reads submissions" on public.profile_submissions;
create policy "admin reads submissions" on public.profile_submissions for select to authenticated
  using ((auth.jwt() ->> 'email') = 'rodrigomelo1912@gmail.com');

drop policy if exists "admin reads ai usage" on public.profile_ai_usage;
create policy "admin reads ai usage" on public.profile_ai_usage for select to authenticated
  using ((auth.jwt() ->> 'email') = 'rodrigomelo1912@gmail.com');

create or replace function public.admin_profile_ai_usage(p_since timestamptz default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_summary jsonb;
  v_daily jsonb;
  v_recent jsonb;
  v_first timestamptz;
begin
  if (auth.jwt() ->> 'email') is distinct from 'rodrigomelo1912@gmail.com' then
    raise exception 'Acesso não autorizado.';
  end if;

  select min(created_at) into v_first from public.profile_ai_usage;
  select jsonb_build_object(
    'requests', count(*),
    'completed', count(*) filter (where outcome = 'completed'),
    'failed', count(*) filter (where outcome = 'failed'),
    'unknown', count(*) filter (where outcome = 'unknown'),
    'withoutUsage', count(*) filter (where total_tokens is null),
    'inputTokens', coalesce(sum(input_tokens), 0),
    'outputTokens', coalesce(sum(output_tokens), 0),
    'totalTokens', coalesce(sum(total_tokens), 0),
    'cachedInputTokens', coalesce(sum(cached_input_tokens), 0),
    'reasoningOutputTokens', coalesce(sum(reasoning_output_tokens), 0)
  ) into v_summary
  from public.profile_ai_usage
  where p_since is null or created_at >= p_since;

  select coalesce(jsonb_agg(jsonb_build_object(
    'day', days.day::date,
    'requests', coalesce(events.requests, 0),
    'tokens', coalesce(events.tokens, 0)
  ) order by days.day), '[]'::jsonb) into v_daily
  from generate_series(current_date - 13, current_date, interval '1 day') as days(day)
  left join (
    select created_at::date as day, count(*) as requests, coalesce(sum(total_tokens), 0) as tokens
    from public.profile_ai_usage
    where created_at >= current_date - 13
    group by created_at::date
  ) events on events.day = days.day::date;

  select coalesce(jsonb_agg(to_jsonb(recent) order by recent.created_at desc), '[]'::jsonb)
    into v_recent
  from (
    select created_at, model, outcome, input_tokens, output_tokens, total_tokens, cached_input_tokens
    from public.profile_ai_usage
    where p_since is null or created_at >= p_since
    order by created_at desc
    limit 20
  ) recent;

  return jsonb_build_object('summary', v_summary, 'daily', v_daily,
    'recent', v_recent, 'firstRecordedAt', v_first);
end;
$$;

revoke all on function public.admin_profile_ai_usage(timestamptz) from public;
revoke all on function public.admin_profile_ai_usage(timestamptz) from anon;
grant execute on function public.admin_profile_ai_usage(timestamptz) to authenticated;

create or replace function public.redeem_profile_token(p_code text, p_submission jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_token public.profile_tokens;
begin
  if coalesce(length(trim(p_code)), 0) < 8 then
    return jsonb_build_object('ok', false, 'message', 'Informe um token válido.');
  end if;
  if coalesce(trim(p_submission ->> 'name'), '') = '' or coalesce(trim(p_submission ->> 'email'), '') = ''
    or coalesce(trim(p_submission ->> 'phone'), '') = '' or coalesce(trim(p_submission ->> 'company'), '') = ''
    or coalesce(trim(p_submission ->> 'jobTitle'), '') = '' then
    return jsonb_build_object('ok', false, 'message', 'Preencha todos os dados antes de liberar o laudo.');
  end if;

  update public.profile_tokens set status = 'used', used_at = now()
  where code_hash = encode(extensions.digest(upper(trim(p_code)), 'sha256'), 'hex') and status = 'active'
  returning * into v_token;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Este token não está disponível.');
  end if;

  insert into public.profile_submissions (token_id, name, email, phone, company, job_title, profile, answers, report_html, ai_consent)
  values (v_token.id, trim(p_submission ->> 'name'), trim(p_submission ->> 'email'), trim(p_submission ->> 'phone'), trim(p_submission ->> 'company'), trim(p_submission ->> 'jobTitle'), coalesce(p_submission -> 'profile', '{}'::jsonb), coalesce(p_submission -> 'answers', '[]'::jsonb), nullif(p_submission ->> 'reportHtml', ''), coalesce((p_submission ->> 'aiConsent')::boolean, false));
  return jsonb_build_object('ok', true, 'tokenHint', v_token.code_hint);
end;
$$;

revoke all on function public.redeem_profile_token(text, jsonb) from public;
grant execute on function public.redeem_profile_token(text, jsonb) to anon, authenticated;

create or replace function public.delete_profile_token(p_token_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() ->> 'email') is distinct from 'rodrigomelo1912@gmail.com' then
    raise exception 'Acesso não autorizado.';
  end if;

  delete from public.profile_submissions where token_id = p_token_id;
  delete from public.profile_tokens where id = p_token_id;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Token não encontrado.');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.delete_profile_token(uuid) from public;
grant execute on function public.delete_profile_token(uuid) to authenticated;

create or replace function public.claim_profile_enrichment(p_code text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_submission record;
begin
  update public.profile_submissions s
  set ai_claimed_at = now(), ai_attempts = s.ai_attempts + 1
  from public.profile_tokens t
  where t.id = s.token_id
    and t.code_hash = encode(extensions.digest(upper(trim(p_code)), 'sha256'), 'hex')
    and t.status = 'used' and s.ai_consent and s.ai_text is null
    and s.ai_attempts < 2
    and (s.ai_claimed_at is null or s.ai_claimed_at < now() - interval '3 minutes')
  returning s.id, s.profile, s.answers into v_submission;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Esta análise já foi solicitada ou não foi autorizada.');
  end if;
  return jsonb_build_object('ok', true, 'submissionId', v_submission.id, 'profile', v_submission.profile, 'answers', v_submission.answers);
end;
$$;

revoke all on function public.claim_profile_enrichment(text) from public;
grant execute on function public.claim_profile_enrichment(text) to service_role;

create or replace function public.save_profile_enrichment(p_submission_id uuid, p_text jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.profile_submissions
  set ai_text = p_text
  where id = p_submission_id and ai_consent and ai_text is null;
  return found;
end;
$$;

revoke all on function public.save_profile_enrichment(uuid, jsonb) from public;
grant execute on function public.save_profile_enrichment(uuid, jsonb) to service_role;

create or replace function public.archive_personalized_report(p_code text, p_html text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  if length(p_html) > 1000000 or p_html !~* '^<!doctype html>' then
    return false;
  end if;
  update public.profile_submissions s
  set report_html = p_html, ai_archived_at = now()
  from public.profile_tokens t
  where t.id = s.token_id
    and t.code_hash = encode(extensions.digest(upper(trim(p_code)), 'sha256'), 'hex')
    and t.status = 'used' and s.ai_consent
    and s.ai_text is not null and s.ai_archived_at is null;
  return found;
end;
$$;

revoke all on function public.archive_personalized_report(text, text) from public;
grant execute on function public.archive_personalized_report(text, text) to service_role;
