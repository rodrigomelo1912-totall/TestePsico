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

alter table public.profile_tokens enable row level security;
alter table public.profile_token_batches enable row level security;
alter table public.profile_submissions enable row level security;

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

  insert into public.profile_submissions (token_id, name, email, phone, company, job_title, profile, answers)
  values (v_token.id, trim(p_submission ->> 'name'), trim(p_submission ->> 'email'), trim(p_submission ->> 'phone'), trim(p_submission ->> 'company'), trim(p_submission ->> 'jobTitle'), coalesce(p_submission -> 'profile', '{}'::jsonb), coalesce(p_submission -> 'answers', '[]'::jsonb));
  return jsonb_build_object('ok', true, 'tokenHint', v_token.code_hint);
end;
$$;

revoke all on function public.redeem_profile_token(text, jsonb) from public;
grant execute on function public.redeem_profile_token(text, jsonb) to anon, authenticated;
