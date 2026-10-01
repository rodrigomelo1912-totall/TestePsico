alter table public.profile_submissions
  add column if not exists report_html text,
  add column if not exists ai_consent boolean not null default false,
  add column if not exists ai_text jsonb,
  add column if not exists ai_claimed_at timestamptz,
  add column if not exists ai_attempts integer not null default 0,
  add column if not exists ai_archived_at timestamptz;

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
