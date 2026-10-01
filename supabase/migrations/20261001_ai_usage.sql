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

alter table public.profile_ai_usage enable row level security;
revoke all on public.profile_ai_usage from anon, authenticated;
grant select on public.profile_ai_usage to authenticated;
grant insert on public.profile_ai_usage to service_role;

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
