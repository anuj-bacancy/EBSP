insert into public.profiles (id, full_name, email, role, title)
values
  ('11111111-1111-1111-1111-111111111111', 'Avery Quinn', 'platform@northstar.demo', 'platform_admin', 'Platform Admin'),
  ('22222222-2222-2222-2222-222222222222', 'Jordan Park', 'compliance@northstar.demo', 'compliance_admin', 'Compliance Lead'),
  ('33333333-3333-3333-3333-333333333333', 'Maya Chen', 'ops@acme-pay.demo', 'partner_admin', 'GM, Embedded Finance'),
  ('44444444-4444-4444-4444-444444444444', 'Theo Watts', 'dev@acme-pay.demo', 'partner_developer', 'Lead Developer'),
  ('55555555-5555-5555-5555-555555555555', 'Rhea Sloan', 'ops@orbit-health.demo', 'partner_ops', 'Operations Manager')
on conflict (id) do nothing;

insert into public.partners (id, slug, name, status, environment_mode, branding, webhook_config, rate_limit_rpm)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'acme-pay',
    'Acme Pay',
    'active',
    'sandbox',
    '{"primaryColor":"#0f766e","accentColor":"#f97316","logoText":"Acme Pay"}',
    '{"endpoint":"https://acme.demo/hooks/northstar"}',
    600
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'orbit-health',
    'Orbit Health',
    'active',
    'sandbox',
    '{"primaryColor":"#1d4ed8","accentColor":"#eab308","logoText":"Orbit Health"}',
    '{"endpoint":"https://orbit.demo/baas/events"}',
    900
  )
on conflict (id) do nothing;

insert into public.partner_memberships (id, partner_id, profile_id, role)
values
  ('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'partner_admin'),
  ('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'partner_developer'),
  ('10000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'partner_ops')
on conflict (id) do nothing;

insert into public.fee_schedules (
  id, partner_id, subscription_tier, ach_debit_fee_cents, ach_credit_fee_cents, card_issuance_fee_cents, webhook_event_fee_cents, revenue_share_bps
)
values
  ('20000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'growth', 35, 25, 150, 3, 80),
  ('20000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'starter', 45, 30, 180, 5, 60)
on conflict (id) do nothing;

insert into public.subscriptions (id, partner_id, tier, status, monthly_fee_cents)
values
  ('21000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'growth', 'active', 149900),
  ('21000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'starter', 'trialing', 49900)
on conflict (id) do nothing;

insert into public.api_keys (id, partner_id, name, prefix, key_hash, scopes, created_at)
values
  (
    '22000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Acme Sandbox SDK',
    'ns_live_acme',
    'f5bb64d9177c13d3e6f3a0fcb0f8e0c0e0cc1cf67f0f336b3b3e3017fb4ce55d',
    '{"accounts:write","transfers:write","cards:write","webhooks:read"}',
    now() - interval '21 days'
  ),
  (
    '22000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Orbit Internal Tools',
    'ns_live_orbit',
    '87a6be0ed415f9d4e4dc8c2fdb746f167c703e52e5f4ad5d6e622ddb2912cbce',
    '{"accounts:read","transfers:write","kyc:write"}',
    now() - interval '14 days'
  )
on conflict (id) do nothing;

insert into public.end_users (
  id, partner_id, legal_name, dob, masked_ssn, email, phone, address, kyc_status, risk_flags, metadata, created_by
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Elena Rodriguez',
    '1991-04-18',
    '***-**-1221',
    'elena@acme-pay.demo',
    '+1-415-555-0100',
    '{"line1":"101 Market St","city":"San Francisco","state":"CA","postalCode":"94105"}',
    'approved',
    '{"velocity_watch"}',
    '{"segment":"gig_worker"}',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Samir Patel',
    '1987-07-09',
    '***-**-8891',
    'samir@acme-pay.demo',
    '+1-415-555-0101',
    '{"line1":"88 Howard St","city":"San Francisco","state":"CA","postalCode":"94105"}',
    'under_review',
    '{"pep_review"}',
    '{"segment":"contractor"}',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Darwin Brooks',
    '1984-11-22',
    '***-**-4470',
    'darwin@orbit-health.demo',
    '+1-646-555-0190',
    '{"line1":"22 Hudson Yards","city":"New York","state":"NY","postalCode":"10001"}',
    'approved',
    '{}',
    '{"segment":"clinic_admin"}',
    '55555555-5555-5555-5555-555555555555'
  )
on conflict (id) do nothing;

insert into public.beneficiaries (id, partner_id, account_holder_name, routing_number, masked_account_number, bank_name)
values
  ('31000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mercury Payroll LLC', '121000248', '****0021', 'Mercury Bank'),
  ('31000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Doorstep Ops Inc', '091000019', '****9203', 'Wells Fargo'),
  ('31000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Care Supplier Group', '026009593', '****7234', 'Bank of America')
on conflict (id) do nothing;

insert into public.accounts (
  id, partner_id, end_user_id, type, status, nickname, routing_number, account_number_token, available_limit_cents, metadata, created_by, created_at, updated_at
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '30000000-0000-0000-0000-000000000001',
    'checking',
    'active',
    'Instant Payout',
    '031000503',
    'acc_tok_7342',
    250000,
    '{"product":"northstar-checking"}',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '30 days',
    now() - interval '2 days'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '30000000-0000-0000-0000-000000000002',
    'savings',
    'pending',
    'Tax Reserve',
    '031000503',
    'acc_tok_8421',
    150000,
    '{"product":"reserve-wallet"}',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '14 days',
    now() - interval '3 days'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '30000000-0000-0000-0000-000000000003',
    'business_checking',
    'active',
    'Care Settlement',
    '026009593',
    'acc_tok_1147',
    500000,
    '{"product":"business-checking"}',
    '55555555-5555-5555-5555-555555555555',
    now() - interval '45 days',
    now() - interval '1 day'
  )
on conflict (id) do nothing;

insert into public.balances (account_id, partner_id, available_cents, pending_cents, ledger_cents, created_at, updated_at)
values
  ('40000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 485000, 22000, 507000, now() - interval '30 days', now() - interval '1 day'),
  ('40000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 92000, 0, 92000, now() - interval '14 days', now() - interval '2 days'),
  ('40000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1280000, 15000, 1295000, now() - interval '45 days', now() - interval '1 day')
on conflict (account_id) do nothing;

insert into public.transfers (
  id, partner_id, account_id, beneficiary_id, amount_cents, direction, speed, status, idempotency_key, reason_code, settlement_date, metadata, created_by, created_at, updated_at
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '40000000-0000-0000-0000-000000000001',
    '31000000-0000-0000-0000-000000000001',
    22000,
    'debit',
    'same_day',
    'settled',
    'idem-acme-22000',
    null,
    current_date - 1,
    '{"sandbox":true}',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '40000000-0000-0000-0000-000000000002',
    '31000000-0000-0000-0000-000000000002',
    17500,
    'debit',
    'next_day',
    'pending',
    'idem-acme-17500',
    null,
    current_date + 1,
    '{"sandbox":true}',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '3 hours',
    now() - interval '3 hours'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '40000000-0000-0000-0000-000000000003',
    '31000000-0000-0000-0000-000000000003',
    15000,
    'credit',
    'same_day',
    'submitted',
    'idem-orbit-15000',
    null,
    current_date,
    '{"sandbox":true}',
    '55555555-5555-5555-5555-555555555555',
    now() - interval '6 hours',
    now() - interval '6 hours'
  )
on conflict (id) do nothing;

insert into public.transactions (
  id, partner_id, account_id, amount_cents, currency, status, direction, rail, description, merchant, location, mcc, risk_score, risk_action, explainability, transfer_id, created_at
)
values
  (
    '51000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '40000000-0000-0000-0000-000000000001',
    22000,
    'USD',
    'settled',
    'debit',
    'ach',
    'Sandbox ACH transfer',
    'Mercury Payroll LLC',
    'San Francisco, CA',
    '4214',
    712,
    'review',
    '[{"key":"amount","label":"Amount","value":22000,"weight":0.45,"reason":"High transfer amount."},{"key":"velocity","label":"Velocity","value":2,"weight":0.2,"reason":"Multiple outbound moves."}]',
    '50000000-0000-0000-0000-000000000001',
    now() - interval '1 day'
  ),
  (
    '51000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '40000000-0000-0000-0000-000000000002',
    17500,
    'USD',
    'pending',
    'debit',
    'ach',
    'Sandbox ACH transfer',
    'Doorstep Ops Inc',
    'Oakland, CA',
    '4214',
    488,
    'flag',
    '[{"key":"amount","label":"Amount","value":17500,"weight":0.3,"reason":"Elevated amount."}]',
    '50000000-0000-0000-0000-000000000002',
    now() - interval '3 hours'
  ),
  (
    '51000000-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '40000000-0000-0000-0000-000000000003',
    15000,
    'USD',
    'pending',
    'credit',
    'ach',
    'Provider reimbursement',
    'Care Supplier Group',
    'New York, NY',
    '8099',
    242,
    'allow',
    '[{"key":"amount","label":"Amount","value":15000,"weight":0.1,"reason":"Routine inbound reimbursement."}]',
    '50000000-0000-0000-0000-000000000003',
    now() - interval '6 hours'
  )
on conflict (id) do nothing;

insert into public.ledger_entries (id, partner_id, account_id, transaction_id, transfer_id, entry_type, direction, amount_cents, created_at)
values
  ('52000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '40000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'hold', 'debit', 22000, now() - interval '1 day'),
  ('52000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '40000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'settlement', 'debit', 22000, now() - interval '23 hours'),
  ('52000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '40000000-0000-0000-0000-000000000002', '51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'hold', 'debit', 17500, now() - interval '3 hours'),
  ('52000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '40000000-0000-0000-0000-000000000003', '51000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'hold', 'credit', 15000, now() - interval '6 hours')
on conflict (id) do nothing;

insert into public.cards (
  id, partner_id, account_id, cardholder_name, masked_pan, last_four, expiry, network, status, spending_controls, metadata, created_at, updated_at
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '40000000-0000-0000-0000-000000000001',
    'Elena Rodriguez',
    '4111 11•• •••• 4242',
    '4242',
    '12/29',
    'VISA',
    'active',
    '{"dailyLimitCents":85000,"transactionLimitCents":22000,"merchantCategoryAllowlist":["5734","4112","5047"]}',
    '{"sandbox":true}',
    now() - interval '20 days',
    now() - interval '1 day'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '40000000-0000-0000-0000-000000000003',
    'Darwin Brooks',
    '4111 11•• •••• 1184',
    '1184',
    '10/28',
    'VISA',
    'requested',
    '{"dailyLimitCents":65000,"transactionLimitCents":15000,"merchantCategoryAllowlist":["8062","8099"]}',
    '{"sandbox":true}',
    now() - interval '7 days',
    now() - interval '7 days'
  )
on conflict (id) do nothing;

insert into public.kyc_cases (
  id, partner_id, end_user_id, status, provider_decision, ofac_flag, pep_flag, reasons, notes, metadata, created_by, created_at, updated_at
)
values
  (
    '70000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '30000000-0000-0000-0000-000000000001',
    'approved',
    'pass',
    false,
    false,
    '{"identity_match","watchlist_clear"}',
    'Auto-approved by sandbox KYC engine',
    '{"sandbox":true}',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '29 days',
    now() - interval '29 days'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '30000000-0000-0000-0000-000000000002',
    'under_review',
    'review',
    false,
    true,
    '{"document_quality_check","pep_review"}',
    'Compliance analyst review required',
    '{"sandbox":true}',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '12 days',
    now() - interval '1 day'
  ),
  (
    '70000000-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '30000000-0000-0000-0000-000000000003',
    'approved',
    'pass',
    false,
    false,
    '{"identity_match"}',
    'Approved after document review',
    '{"sandbox":true}',
    '55555555-5555-5555-5555-555555555555',
    now() - interval '44 days',
    now() - interval '43 days'
  )
on conflict (id) do nothing;

insert into public.kyc_documents (id, partner_id, end_user_id, document_type, storage_path, metadata, created_at)
values
  (
    '71000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '30000000-0000-0000-0000-000000000002',
    'drivers_license',
    'kyc-documents/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/30000000-0000-0000-0000-000000000002/license-front.png',
    '{"fileName":"license-front.png","contentType":"image/png"}',
    now() - interval '12 days'
  ),
  (
    '71000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '30000000-0000-0000-0000-000000000003',
    'utility_bill',
    'kyc-documents/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/30000000-0000-0000-0000-000000000003/utility-bill.pdf',
    '{"fileName":"utility-bill.pdf","contentType":"application/pdf"}',
    now() - interval '44 days'
  )
on conflict (id) do nothing;

insert into public.compliance_cases (id, partner_id, type, severity, status, subject, assigned_to, metadata, created_at, updated_at)
values
  (
    '80000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aml_alert',
    'high',
    'under_review',
    'Repeated high-velocity payouts for Elena Rodriguez',
    'Jordan Park',
    '{"queue":"aml"}',
    now() - interval '2 days',
    now() - interval '8 hours'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ctr',
    'medium',
    'open',
    'High daily inflows for Darwin Brooks',
    null,
    '{"queue":"regulatory"}',
    now() - interval '1 day',
    now() - interval '1 day'
  )
on conflict (id) do nothing;

insert into public.fraud_alerts (id, partner_id, transaction_id, score, action, status, summary, created_at)
values
  (
    '81000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '51000000-0000-0000-0000-000000000001',
    712,
    'review',
    'reviewing',
    'Transfer 50000000-0000-0000-0000-000000000001 scored 712 and triggered review.',
    now() - interval '1 day'
  ),
  (
    '81000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '51000000-0000-0000-0000-000000000002',
    488,
    'flag',
    'open',
    'Transfer 50000000-0000-0000-0000-000000000002 scored 488 and triggered flag.',
    now() - interval '3 hours'
  )
on conflict (id) do nothing;

insert into public.webhooks (id, partner_id, endpoint, secret_hash, subscribed_events, status, created_at, updated_at)
values
  (
    '90000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'https://acme.demo/hooks/northstar',
    'whsec_acme_hash',
    '{"account.created","transfer.created","transfer.settled","card.created","fraud.alert.created"}',
    'healthy',
    now() - interval '20 days',
    now() - interval '1 day'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'https://orbit.demo/baas/events',
    'whsec_orbit_hash',
    '{"kyc.updated","transfer.created","transfer.failed"}',
    'degraded',
    now() - interval '18 days',
    now() - interval '6 hours'
  )
on conflict (id) do nothing;

insert into public.webhook_deliveries (id, partner_id, webhook_id, event_type, attempt_count, last_response_code, last_attempt_at, status, metadata)
values
  (
    '91000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '90000000-0000-0000-0000-000000000001',
    'transfer.settled',
    1,
    202,
    now() - interval '23 hours',
    'delivered',
    '{"payload":{"transferId":"50000000-0000-0000-0000-000000000001"}}'
  ),
  (
    '91000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '90000000-0000-0000-0000-000000000002',
    'kyc.updated',
    3,
    500,
    now() - interval '5 hours',
    'failed',
    '{"payload":{"kycCaseId":"70000000-0000-0000-0000-000000000003"}}'
  )
on conflict (id) do nothing;

insert into public.audit_logs (id, partner_id, actor, action, entity_type, entity_id, before_summary, after_summary, created_at)
values
  ('92000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maya Chen', 'account.created', 'account', '40000000-0000-0000-0000-000000000001', null, 'status=active', now() - interval '30 days'),
  ('92000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Northstar ACH Engine', 'transfer.settled', 'transfer', '50000000-0000-0000-0000-000000000001', 'status=submitted', 'status=settled', now() - interval '23 hours'),
  ('92000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Jordan Park', 'compliance_case.updated', 'compliance_case', '80000000-0000-0000-0000-000000000002', 'status=open', 'status=under_review', now() - interval '4 hours')
on conflict (id) do nothing;

insert into public.notifications (id, partner_id, event_type, title, body, is_read, created_at)
values
  ('93000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fraud.alert.created', 'Fraud alert created', 'Transfer 50000000-0000-0000-0000-000000000002 scored 488.', false, now() - interval '3 hours'),
  ('93000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'card.updated', 'Card controls updated', 'Daily limit changed for Elena Rodriguez.', true, now() - interval '12 hours'),
  ('93000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'webhook.delivery_failed', 'Webhook delivery failed', 'Orbit Health webhook failed with 500 response.', false, now() - interval '5 hours')
on conflict (id) do nothing;

insert into public.statements (id, partner_id, account_id, month, opening_balance_cents, closing_balance_cents, transaction_count, file_path, created_at)
values
  ('94000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '40000000-0000-0000-0000-000000000001', '2026-02', 430000, 507000, 18, 'statements/acme/2026-02-acct-001.txt', now() - interval '12 days'),
  ('94000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '40000000-0000-0000-0000-000000000003', '2026-02', 1225000, 1295000, 9, 'statements/orbit/2026-02-acct-003.txt', now() - interval '12 days')
on conflict (id) do nothing;

insert into public.risk_rules (id, name, threshold, action, created_at)
values
  ('95000000-0000-0000-0000-000000000001', 'Low risk allow', 350, 'allow', now() - interval '60 days'),
  ('95000000-0000-0000-0000-000000000002', 'Medium risk flag', 500, 'flag', now() - interval '60 days'),
  ('95000000-0000-0000-0000-000000000003', 'High risk review', 700, 'review', now() - interval '60 days'),
  ('95000000-0000-0000-0000-000000000004', 'Severe decline', 850, 'decline', now() - interval '60 days')
on conflict (id) do nothing;

insert into public.usage_events (id, partner_id, metric, value, created_at)
values
  ('96000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'accounts_created', 12, now() - interval '7 days'),
  ('96000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ach_volume_cents', 875000, now() - interval '1 day'),
  ('96000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cards_issued', 4, now() - interval '4 days'),
  ('96000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'webhook_failures', 2, now() - interval '5 hours')
on conflict (id) do nothing;
