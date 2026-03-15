begin;

create extension if not exists "pgcrypto";

drop trigger if exists on_auth_user_created on auth.users;

do $$
declare
  fn record;
begin
  for fn in
    select
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as identity_args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'handle_new_user',
        'current_profile_id',
        'current_partner_ids',
        'create_account_for_partner',
        'create_transfer_for_partner',
        'issue_card_for_partner',
        'rotate_api_key_for_partner',
        'mark_notification_read'
      )
  loop
    execute format(
      'drop function if exists %I.%I(%s) cascade',
      fn.schema_name,
      fn.function_name,
      fn.identity_args
    );
  end loop;
end
$$;

drop table if exists public.rate_limit_buckets cascade;
drop table if exists public.compliance_records cascade;
drop table if exists public.webhook_events cascade;
drop table if exists public.users cascade;
drop table if exists public.ledger_entries cascade;
drop table if exists public.usage_events cascade;
drop table if exists public.risk_rules cascade;
drop table if exists public.statements cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.notifications cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.webhook_deliveries cascade;
drop table if exists public.webhooks cascade;
drop table if exists public.fraud_alerts cascade;
drop table if exists public.compliance_cases cascade;
drop table if exists public.kyc_documents cascade;
drop table if exists public.kyc_cases cascade;
drop table if exists public.cards cascade;
drop table if exists public.transfers cascade;
drop table if exists public.transactions cascade;
drop table if exists public.beneficiaries cascade;
drop table if exists public.balances cascade;
drop table if exists public.accounts cascade;
drop table if exists public.end_users cascade;
drop table if exists public.api_keys cascade;
drop table if exists public.fee_schedules cascade;
drop table if exists public.partner_memberships cascade;
drop table if exists public.partners cascade;
drop table if exists public.profiles cascade;

drop type if exists public.card_status cascade;
drop type if exists public.transfer_status cascade;
drop type if exists public.kyc_status cascade;
drop type if exists public.account_status cascade;
drop type if exists public.account_type cascade;
drop type if exists public.environment_mode cascade;
drop type if exists public.partner_status cascade;
drop type if exists public.app_role cascade;

create type public.app_role as enum (
  'platform_admin',
  'compliance_admin',
  'partner_admin',
  'partner_ops',
  'partner_developer',
  'end_user'
);

create type public.partner_status as enum ('pending', 'active', 'suspended');
create type public.environment_mode as enum ('sandbox', 'live');
create type public.account_type as enum ('checking', 'savings', 'business_checking');
create type public.account_status as enum ('pending', 'active', 'suspended', 'frozen', 'closed');
create type public.kyc_status as enum ('pending', 'under_review', 'approved', 'rejected', 'needs_info');
create type public.transfer_status as enum ('created', 'pending', 'submitted', 'settled', 'failed', 'returned', 'reversed');
create type public.card_status as enum ('requested', 'active', 'locked', 'replaced', 'closed');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  full_name text not null,
  email text not null unique,
  role public.app_role not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status public.partner_status not null default 'pending',
  environment_mode public.environment_mode not null default 'sandbox',
  branding jsonb not null default '{}'::jsonb,
  webhook_config jsonb not null default '{}'::jsonb,
  rate_limit_rpm integer not null default 120,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partner_memberships (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (partner_id, profile_id)
);

create table public.fee_schedules (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  subscription_tier text not null check (subscription_tier in ('starter', 'growth', 'enterprise')),
  ach_debit_fee_cents integer not null default 0,
  ach_credit_fee_cents integer not null default 0,
  card_issuance_fee_cents integer not null default 0,
  webhook_event_fee_cents integer not null default 0,
  revenue_share_bps integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  name text not null,
  prefix text not null,
  key_hash text not null,
  scopes text[] not null default '{}',
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.end_users (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  legal_name text not null,
  dob date not null,
  masked_ssn text not null,
  email text not null,
  phone text,
  address jsonb not null default '{}'::jsonb,
  kyc_status public.kyc_status not null default 'pending',
  risk_flags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  end_user_id uuid not null references public.end_users(id) on delete cascade,
  type public.account_type not null,
  status public.account_status not null default 'pending',
  nickname text not null,
  routing_number text not null,
  account_number_token text not null,
  available_limit_cents bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.balances (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  available_cents bigint not null default 0,
  pending_cents bigint not null default 0,
  ledger_cents bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_holder_name text not null,
  routing_number text not null,
  masked_account_number text not null,
  bank_name text not null,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'USD',
  status text not null check (status in ('pending', 'settled', 'failed', 'returned')),
  direction text not null check (direction in ('credit', 'debit')),
  rail text not null check (rail in ('ach', 'card', 'adjustment')),
  description text not null,
  merchant text,
  location text,
  mcc text,
  risk_score integer check (risk_score between 0 and 1000),
  risk_action text check (risk_action in ('allow', 'flag', 'review', 'decline')),
  explainability jsonb not null default '[]'::jsonb,
  transfer_id uuid,
  card_id uuid,
  created_at timestamptz not null default now()
);

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  beneficiary_id uuid references public.beneficiaries(id),
  amount_cents bigint not null check (amount_cents > 0),
  direction text not null check (direction in ('credit', 'debit')),
  speed text not null check (speed in ('standard', 'same_day', 'next_day')),
  status public.transfer_status not null default 'created',
  idempotency_key text not null,
  reason_code text,
  settlement_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, idempotency_key)
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  cardholder_name text not null,
  masked_pan text not null,
  last_four text not null,
  expiry text not null,
  network text not null,
  status public.card_status not null default 'requested',
  spending_controls jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kyc_cases (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  end_user_id uuid not null references public.end_users(id) on delete cascade,
  status public.kyc_status not null default 'pending',
  provider_decision text not null check (provider_decision in ('pass', 'fail', 'review')),
  ofac_flag boolean not null default false,
  pep_flag boolean not null default false,
  reasons text[] not null default '{}',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  end_user_id uuid not null references public.end_users(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.compliance_cases (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  type text not null check (type in ('sar', 'ctr', 'aml_alert', 'ofac')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null check (status in ('open', 'under_review', 'escalated', 'closed', 'filed')),
  subject text not null,
  assigned_to text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fraud_alerts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  transaction_id uuid references public.transactions(id),
  score integer not null check (score between 0 and 1000),
  action text not null check (action in ('allow', 'flag', 'review', 'decline')),
  status text not null check (status in ('open', 'reviewing', 'resolved')),
  summary text not null,
  created_at timestamptz not null default now()
);

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  endpoint text not null,
  secret_hash text not null,
  webhook_secret_encrypted text not null,
  subscribed_events text[] not null default '{}',
  status text not null check (status in ('healthy', 'degraded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  webhook_id uuid not null references public.webhooks(id) on delete cascade,
  event_type text not null,
  attempt_count integer not null default 0,
  last_response_code integer,
  last_attempt_at timestamptz,
  status text not null check (status in ('delivered', 'failed', 'retrying')),
  metadata jsonb not null default '{}'::jsonb
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_summary text,
  after_summary text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  tier text not null check (tier in ('starter', 'growth', 'enterprise')),
  status text not null check (status in ('active', 'trialing', 'canceled')),
  monthly_fee_cents bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.statements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  month text not null,
  opening_balance_cents bigint not null default 0,
  closing_balance_cents bigint not null default 0,
  transaction_count integer not null default 0,
  file_path text,
  created_at timestamptz not null default now()
);

create table public.risk_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  threshold integer not null,
  action text not null check (action in ('allow', 'flag', 'review', 'decline')),
  created_at timestamptz not null default now()
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  metric text not null,
  value integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  transfer_id uuid references public.transfers(id) on delete set null,
  entry_type text not null check (entry_type in ('hold', 'settlement', 'reversal')),
  direction text not null check (direction in ('credit', 'debit')),
  amount_cents bigint not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  profile_id uuid unique references public.profiles(id) on delete cascade,
  role public.app_role not null default 'partner_admin',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  webhook_id uuid not null references public.webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'delivered', 'retrying', 'failed')),
  attempt_count integer not null default 0,
  next_attempt_at timestamptz not null default timezone('utc', now()),
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  compliance_case_id uuid references public.compliance_cases(id) on delete set null,
  record_type text not null check (record_type in ('sar', 'ctr', 'aml_alert', 'ofac')),
  status text not null default 'open' check (status in ('open', 'under_review', 'escalated', 'closed', 'filed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.rate_limit_buckets (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  window_key text not null,
  request_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index idx_partner_memberships_partner_id on public.partner_memberships(partner_id);
create index idx_end_users_partner_id on public.end_users(partner_id);
create index idx_accounts_partner_id on public.accounts(partner_id);
create index idx_balances_partner_id on public.balances(partner_id);
create index idx_transactions_partner_id on public.transactions(partner_id);
create index idx_transfers_partner_id on public.transfers(partner_id);
create index idx_cards_partner_id on public.cards(partner_id);
create index idx_kyc_cases_partner_id on public.kyc_cases(partner_id);
create index idx_compliance_cases_partner_id on public.compliance_cases(partner_id);
create index idx_fraud_alerts_partner_id on public.fraud_alerts(partner_id);
create index idx_webhooks_partner_id on public.webhooks(partner_id);
create index idx_audit_logs_partner_id on public.audit_logs(partner_id);
create index idx_ledger_entries_partner_id on public.ledger_entries(partner_id);
create index idx_users_auth_user_id on public.users(auth_user_id);
create index idx_webhook_events_partner_id on public.webhook_events(partner_id);
create index idx_webhook_events_status on public.webhook_events(status, next_attempt_at);
create index idx_compliance_records_partner_id on public.compliance_records(partner_id);
create index idx_rate_limit_buckets_partner_request_at on public.rate_limit_buckets(partner_id, request_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, full_name, email, role, title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'partner_admin',
    coalesce(new.raw_user_meta_data ->> 'title', 'Founder')
  )
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        full_name = excluded.full_name,
        updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_partner_ids()
returns setof uuid
language sql
stable
as $$
  select partner_id
  from public.partner_memberships
  where profile_id = public.current_profile_id()
$$;

create or replace function public.create_account_for_partner(
  p_partner_id uuid,
  p_end_user_id uuid,
  p_type public.account_type,
  p_nickname text,
  p_actor_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  insert into public.accounts (
    partner_id,
    end_user_id,
    type,
    status,
    nickname,
    routing_number,
    account_number_token,
    available_limit_cents,
    created_by
  )
  values (
    p_partner_id,
    p_end_user_id,
    p_type,
    'pending',
    p_nickname,
    '031000503',
    encode(gen_random_bytes(8), 'hex'),
    250000,
    p_actor_id
  )
  returning id into v_account_id;

  insert into public.balances (account_id, partner_id)
  values (v_account_id, p_partner_id);

  insert into public.audit_logs (partner_id, actor, action, entity_type, entity_id, after_summary)
  values (
    p_partner_id,
    coalesce((select full_name from public.profiles where id = p_actor_id), 'System'),
    'account.created',
    'account',
    v_account_id::text,
    'status=pending'
  );

  return v_account_id;
end;
$$;

create or replace function public.create_transfer_for_partner(
  p_partner_id uuid,
  p_account_id uuid,
  p_beneficiary_id uuid,
  p_amount_cents bigint,
  p_direction text,
  p_speed text,
  p_idempotency_key text,
  p_reason_code text,
  p_risk_score integer,
  p_risk_action text,
  p_explainability jsonb,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer_id uuid := gen_random_uuid();
  v_transaction_id uuid := gen_random_uuid();
  v_status public.transfer_status := 'created';
  v_transaction_status text := 'pending';
  v_settlement_date date;
begin
  if exists (
    select 1
    from public.transfers
    where partner_id = p_partner_id
      and idempotency_key = p_idempotency_key
  ) then
    raise exception 'Duplicate idempotency key';
  end if;

  if p_speed = 'standard' then
    v_status := 'pending';
  elsif p_speed = 'same_day' then
    v_status := 'submitted';
  else
    v_status := 'pending';
  end if;

  if p_reason_code is not null then
    v_status := 'failed';
    v_transaction_status := 'failed';
  end if;

  v_settlement_date := case
    when p_speed = 'same_day' then current_date
    when p_speed = 'next_day' then current_date + interval '1 day'
    else current_date + interval '2 day'
  end;

  insert into public.transfers (
    id,
    partner_id,
    account_id,
    beneficiary_id,
    amount_cents,
    direction,
    speed,
    status,
    idempotency_key,
    reason_code,
    settlement_date
  )
  values (
    v_transfer_id,
    p_partner_id,
    p_account_id,
    p_beneficiary_id,
    p_amount_cents,
    p_direction,
    p_speed,
    v_status,
    p_idempotency_key,
    p_reason_code,
    v_settlement_date
  );

  insert into public.transactions (
    id,
    partner_id,
    account_id,
    transfer_id,
    amount_cents,
    direction,
    rail,
    status,
    description,
    merchant,
    location,
    mcc,
    risk_score,
    risk_action,
    explainability
  )
  values (
    v_transaction_id,
    p_partner_id,
    p_account_id,
    v_transfer_id,
    p_amount_cents,
    p_direction,
    'ach',
    v_transaction_status,
    concat('ACH ', upper(p_direction), ' ', upper(replace(p_speed, '_', ' '))),
    'ACH Sandbox',
    'US',
    '4214',
    p_risk_score,
    p_risk_action,
    p_explainability
  );

  insert into public.ledger_entries (
    partner_id,
    account_id,
    transaction_id,
    transfer_id,
    entry_type,
    direction,
    amount_cents
  )
  values (
    p_partner_id,
    p_account_id,
    v_transaction_id,
    v_transfer_id,
    'hold',
    p_direction,
    p_amount_cents
  );

  update public.balances
  set
    pending_cents = pending_cents + case when p_direction = 'credit' then p_amount_cents else -p_amount_cents end,
    ledger_cents = ledger_cents + case when p_direction = 'credit' then p_amount_cents else -p_amount_cents end,
    updated_at = timezone('utc', now())
  where account_id = p_account_id;

  insert into public.audit_logs (
    partner_id,
    actor,
    action,
    entity_type,
    entity_id,
    after_summary
  )
  values (
    p_partner_id,
    coalesce((select full_name from public.profiles where id = p_actor_id), 'API'),
    'transfer.created',
    'transfer',
    v_transfer_id::text,
    concat('amount=', p_amount_cents, ';speed=', p_speed, ';status=', v_status)
  );

  return v_transfer_id;
end;
$$;

create or replace function public.issue_card_for_partner(
  p_partner_id uuid,
  p_account_id uuid,
  p_cardholder_name text,
  p_daily_limit_cents bigint,
  p_transaction_limit_cents bigint,
  p_allowed_mccs text[],
  p_actor_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card_id uuid;
  v_last_four text := lpad((floor(random() * 9999)::int)::text, 4, '0');
begin
  insert into public.cards (
    partner_id,
    account_id,
    cardholder_name,
    masked_pan,
    last_four,
    expiry,
    network,
    status,
    spending_controls,
    metadata
  )
  values (
    p_partner_id,
    p_account_id,
    p_cardholder_name,
    format('4111 11XX XXXX %s', v_last_four),
    v_last_four,
    to_char(current_date + interval '3 years', 'MM/YY'),
    'VISA',
    'requested',
    jsonb_build_object(
      'dailyLimitCents', p_daily_limit_cents,
      'transactionLimitCents', p_transaction_limit_cents,
      'merchantCategoryAllowlist', p_allowed_mccs
    ),
    jsonb_build_object('sandbox', true)
  )
  returning id into v_card_id;

  insert into public.audit_logs (partner_id, actor, action, entity_type, entity_id, after_summary)
  values (
    p_partner_id,
    coalesce((select full_name from public.profiles where id = p_actor_id), 'Sandbox card engine'),
    'card.created',
    'card',
    v_card_id::text,
    'status=requested'
  );

  return v_card_id;
end;
$$;

create or replace function public.rotate_api_key_for_partner(
  p_partner_id uuid,
  p_name text,
  p_prefix text,
  p_key_hash text,
  p_scopes text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key_id uuid;
begin
  insert into public.api_keys (partner_id, name, prefix, key_hash, scopes)
  values (p_partner_id, p_name, p_prefix, p_key_hash, p_scopes)
  returning id into v_key_id;

  return v_key_id;
end;
$$;

create or replace function public.mark_notification_read(
  p_notification_id uuid,
  p_is_read boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set is_read = p_is_read
  where id = p_notification_id;

  return true;
end;
$$;

alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.partner_memberships enable row level security;
alter table public.fee_schedules enable row level security;
alter table public.api_keys enable row level security;
alter table public.end_users enable row level security;
alter table public.accounts enable row level security;
alter table public.balances enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;
alter table public.cards enable row level security;
alter table public.kyc_cases enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.compliance_cases enable row level security;
alter table public.fraud_alerts enable row level security;
alter table public.webhooks enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.statements enable row level security;
alter table public.risk_rules enable row level security;
alter table public.usage_events enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.users enable row level security;
alter table public.webhook_events enable row level security;
alter table public.compliance_records enable row level security;
alter table public.rate_limit_buckets enable row level security;

create policy "profiles are self readable" on public.profiles
for select using (auth.uid() = auth_user_id);

create policy "platform admins read partners" on public.partners
for select using (
  exists (
    select 1
    from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
  or id in (select public.current_partner_ids())
);

create policy "tenant scoped select" on public.partner_memberships
for select using (partner_id in (select public.current_partner_ids()));

create policy "fee schedules tenant scoped" on public.fee_schedules
for select using (partner_id in (select public.current_partner_ids()));

create policy "api keys tenant scoped" on public.api_keys
for select using (partner_id in (select public.current_partner_ids()));

create policy "end users tenant scoped" on public.end_users
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "accounts tenant scoped" on public.accounts
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "balances tenant scoped" on public.balances
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "beneficiaries tenant scoped" on public.beneficiaries
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "transactions tenant scoped" on public.transactions
for select using (partner_id in (select public.current_partner_ids()));

create policy "transfers tenant scoped" on public.transfers
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "cards tenant scoped" on public.cards
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "kyc cases scoped for tenant or compliance" on public.kyc_cases
for select using (
  partner_id in (select public.current_partner_ids())
  or exists (
    select 1
    from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "kyc docs scoped for tenant or compliance" on public.kyc_documents
for select using (
  partner_id in (select public.current_partner_ids())
  or exists (
    select 1
    from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "compliance cases restricted" on public.compliance_cases
for select using (
  exists (
    select 1
    from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "fraud alerts tenant scoped" on public.fraud_alerts
for select using (
  partner_id in (select public.current_partner_ids())
  or exists (
    select 1
    from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "webhooks tenant scoped" on public.webhooks
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "webhook deliveries tenant scoped" on public.webhook_deliveries
for select using (partner_id in (select public.current_partner_ids()));

create policy "audit logs tenant or admin" on public.audit_logs
for select using (
  partner_id in (select public.current_partner_ids())
  or exists (
    select 1
    from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "notifications tenant scoped" on public.notifications
for all using (partner_id in (select public.current_partner_ids()))
with check (partner_id in (select public.current_partner_ids()));

create policy "subscriptions tenant scoped" on public.subscriptions
for select using (partner_id in (select public.current_partner_ids()));

create policy "statements tenant scoped" on public.statements
for select using (partner_id in (select public.current_partner_ids()));

create policy "usage events tenant scoped" on public.usage_events
for select using (partner_id in (select public.current_partner_ids()));

create policy "ledger entries tenant scoped" on public.ledger_entries
for select using (partner_id in (select public.current_partner_ids()));

create policy "risk rules admin readable" on public.risk_rules
for select using (true);

create policy "users self readable" on public.users
for select using (auth.uid() = auth_user_id);

create policy "webhook events tenant scoped" on public.webhook_events
for select using (partner_id in (select public.current_partner_ids()));

create policy "compliance records restricted" on public.compliance_records
for select using (
  partner_id in (select public.current_partner_ids())
  or exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "rate limit buckets tenant scoped" on public.rate_limit_buckets
for select using (partner_id in (select public.current_partner_ids()));

insert into public.users (auth_user_id, profile_id, role)
select auth_user_id, id, role
from public.profiles
where auth_user_id is not null;

insert into public.compliance_records (partner_id, compliance_case_id, record_type, status, details)
select
  partner_id,
  id,
  type,
  status,
  jsonb_build_object('subject', subject, 'assigned_to', assigned_to, 'severity', severity)
from public.compliance_cases;

insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

commit;
