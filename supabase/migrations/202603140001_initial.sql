create extension if not exists "pgcrypto";

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

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  full_name text not null,
  email text not null unique,
  role public.app_role not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
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

create table if not exists public.partner_memberships (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (partner_id, profile_id)
);

create table if not exists public.fee_schedules (
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

create table if not exists public.api_keys (
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

create table if not exists public.end_users (
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

create table if not exists public.accounts (
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

create table if not exists public.balances (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  available_cents bigint not null default 0,
  pending_cents bigint not null default 0,
  ledger_cents bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_holder_name text not null,
  routing_number text not null,
  masked_account_number text not null,
  bank_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
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

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  beneficiary_id uuid references public.beneficiaries(id),
  amount_cents bigint not null check (amount_cents > 0),
  direction text not null check (direction in ('credit', 'debit')),
  speed text not null check (speed in ('same_day', 'next_day')),
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

create table if not exists public.cards (
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

create table if not exists public.kyc_cases (
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

create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  end_user_id uuid not null references public.end_users(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_cases (
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

create table if not exists public.fraud_alerts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  transaction_id uuid references public.transactions(id),
  score integer not null check (score between 0 and 1000),
  action text not null check (action in ('allow', 'flag', 'review', 'decline')),
  status text not null check (status in ('open', 'reviewing', 'resolved')),
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  endpoint text not null,
  secret_hash text not null,
  subscribed_events text[] not null default '{}',
  status text not null check (status in ('healthy', 'degraded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webhook_deliveries (
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

create table if not exists public.audit_logs (
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

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  tier text not null check (tier in ('starter', 'growth', 'enterprise')),
  status text not null check (status in ('active', 'trialing', 'canceled')),
  monthly_fee_cents bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.statements (
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

create table if not exists public.risk_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  threshold integer not null,
  action text not null check (action in ('allow', 'flag', 'review', 'decline')),
  created_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  metric text not null,
  value integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
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

create index if not exists idx_partner_memberships_partner_id on public.partner_memberships(partner_id);
create index if not exists idx_end_users_partner_id on public.end_users(partner_id);
create index if not exists idx_accounts_partner_id on public.accounts(partner_id);
create index if not exists idx_balances_partner_id on public.balances(partner_id);
create index if not exists idx_transactions_partner_id on public.transactions(partner_id);
create index if not exists idx_transfers_partner_id on public.transfers(partner_id);
create index if not exists idx_cards_partner_id on public.cards(partner_id);
create index if not exists idx_kyc_cases_partner_id on public.kyc_cases(partner_id);
create index if not exists idx_compliance_cases_partner_id on public.compliance_cases(partner_id);
create index if not exists idx_fraud_alerts_partner_id on public.fraud_alerts(partner_id);
create index if not exists idx_webhooks_partner_id on public.webhooks(partner_id);
create index if not exists idx_audit_logs_partner_id on public.audit_logs(partner_id);
create index if not exists idx_ledger_entries_partner_id on public.ledger_entries(partner_id);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_partner_ids()
returns setof uuid
language sql
stable
as $$
  select partner_id from public.partner_memberships where profile_id = public.current_profile_id()
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
    select 1 from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "kyc docs scoped for tenant or compliance" on public.kyc_documents
for select using (
  partner_id in (select public.current_partner_ids())
  or exists (
    select 1 from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "compliance cases restricted" on public.compliance_cases
for select using (
  exists (
    select 1 from public.profiles
    where id = public.current_profile_id()
      and role in ('platform_admin', 'compliance_admin')
  )
);

create policy "fraud alerts tenant scoped" on public.fraud_alerts
for select using (
  partner_id in (select public.current_partner_ids())
  or exists (
    select 1 from public.profiles
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
    select 1 from public.profiles
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
  values (p_partner_id, coalesce((select full_name from public.profiles where id = p_actor_id), 'System'), 'account.created', 'account', v_account_id::text, 'status=pending');

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
  p_reason_code text default null,
  p_risk_score integer default null,
  p_risk_action text default null,
  p_explainability jsonb default '[]'::jsonb,
  p_actor_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer_id uuid;
  v_transaction_id uuid;
  v_account_status public.account_status;
  v_status public.transfer_status;
  v_settlement_date date;
begin
  select status into v_account_status
  from public.accounts
  where id = p_account_id and partner_id = p_partner_id
  for update;

  if v_account_status is null then
    raise exception 'Account not found';
  end if;

  if v_account_status = 'frozen' then
    v_status := 'failed';
  elsif p_speed = 'same_day' then
    v_status := 'submitted';
  else
    v_status := 'pending';
  end if;

  v_settlement_date := case when p_speed = 'same_day' then current_date else current_date + interval '1 day' end;

  insert into public.transfers (
    partner_id, account_id, beneficiary_id, amount_cents, direction, speed, status,
    idempotency_key, reason_code, settlement_date, metadata, created_by
  )
  values (
    p_partner_id, p_account_id, p_beneficiary_id, p_amount_cents, p_direction, p_speed, v_status,
    p_idempotency_key, p_reason_code, v_settlement_date, jsonb_build_object('sandbox', true), p_actor_id
  )
  returning id into v_transfer_id;

  insert into public.transactions (
    partner_id, account_id, amount_cents, status, direction, rail, description,
    merchant, risk_score, risk_action, explainability, transfer_id
  )
  values (
    p_partner_id, p_account_id, p_amount_cents,
    case when v_status = 'failed' then 'failed' else 'pending' end,
    p_direction, 'ach',
    'Sandbox ACH transfer',
    'Sandbox beneficiary', p_risk_score, p_risk_action, p_explainability, v_transfer_id
  )
  returning id into v_transaction_id;

  insert into public.ledger_entries (partner_id, account_id, transaction_id, transfer_id, entry_type, direction, amount_cents)
  values (p_partner_id, p_account_id, v_transaction_id, v_transfer_id, 'hold', p_direction, p_amount_cents);

  update public.balances
  set
    pending_cents = pending_cents + case when p_direction = 'credit' then p_amount_cents else -p_amount_cents end,
    ledger_cents = ledger_cents + case when p_direction = 'credit' then p_amount_cents else -p_amount_cents end,
    updated_at = now()
  where account_id = p_account_id and partner_id = p_partner_id;

  insert into public.audit_logs (partner_id, actor, action, entity_type, entity_id, after_summary)
  values (
    p_partner_id,
    coalesce((select full_name from public.profiles where id = p_actor_id), 'Sandbox transfer engine'),
    'transfer.created',
    'transfer',
    v_transfer_id::text,
    format('status=%s amount=%s', v_status, p_amount_cents)
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
    partner_id, account_id, cardholder_name, masked_pan, last_four, expiry, network, status, spending_controls, metadata
  )
  values (
    p_partner_id,
    p_account_id,
    p_cardholder_name,
    format('4111 11•• •••• %s', v_last_four),
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
  values (p_partner_id, coalesce((select full_name from public.profiles where id = p_actor_id), 'Sandbox card engine'), 'card.created', 'card', v_card_id::text, 'status=requested');

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

create or replace function public.mark_notification_read(p_notification_id uuid, p_is_read boolean)
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
