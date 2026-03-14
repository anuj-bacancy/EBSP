// @ts-nocheck
import { format } from "date-fns";

import type {
  Account,
  ApiKeyRecord,
  AuditLog,
  Beneficiary,
  Card,
  ComplianceCase,
  EndUser,
  FeeSchedule,
  FraudAlert,
  KycCase,
  NotificationRecord,
  Partner,
  PartnerMembership,
  Profile,
  StatementRecord,
  TransactionRecord,
  Transfer,
  WebhookDelivery,
  WebhookRecord,
} from "@/types/domain";
import type { Json, TableRow } from "@/types/supabase";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession, type AppSession } from "@/lib/auth/session";

type BalanceRow = TableRow<"balances">;

function toBranding(value: Json) {
  const branding = typeof value === "object" && value && !Array.isArray(value) ? value : {};

  return {
    primaryColor: String((branding as Record<string, Json>).primaryColor ?? "#0f766e"),
    accentColor: String((branding as Record<string, Json>).accentColor ?? "#f97316"),
    logoText: String((branding as Record<string, Json>).logoText ?? "Northstar"),
  };
}

function toWebhookConfig(value: Json) {
  const config = typeof value === "object" && value && !Array.isArray(value) ? value : {};
  return {
    endpoint: String((config as Record<string, Json>).endpoint ?? ""),
  };
}

function jsonObject(value: Json | null | undefined) {
  return typeof value === "object" && value && !Array.isArray(value) ? (value as Record<string, Json>) : {};
}

function requireArray<T>(value: T[] | null | undefined) {
  return value ?? [];
}

async function getSupabaseOrThrow() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return supabase;
}

export async function getViewerContext() {
  return requireSession();
}

function accessiblePartnerIds(session: AppSession) {
  return session.memberships.map((membership) => membership.partner_id);
}

function isAdmin(session: AppSession) {
  return session.role === "platform_admin" || session.role === "compliance_admin";
}

async function fetchBalancesForAccounts(accountIds: string[]) {
  if (!accountIds.length) {
    return new Map<string, BalanceRow>();
  }

  const supabase = await getSupabaseOrThrow();
  const { data } = await supabase.from("balances").select("*").in("account_id", accountIds);

  return new Map((data ?? []).map((balance) => [balance.account_id, balance]));
}

export async function listPartners(session: AppSession): Promise<Partner[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("partners").select("*").order("created_at", { ascending: true });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("id", accessiblePartnerIds(session));

  return requireArray(data).map((partner) => ({
    id: partner.id,
    slug: partner.slug,
    name: partner.name,
    status: partner.status,
    environmentMode: partner.environment_mode,
    branding: toBranding(partner.branding),
    plan: "starter",
    webhookUrl: toWebhookConfig(partner.webhook_config).endpoint,
    webhookSecretPreview: "Managed in Supabase",
    rateLimitRpm: partner.rate_limit_rpm,
    feeScheduleId: "",
    createdAt: partner.created_at,
    updatedAt: partner.updated_at,
  }));
}

export async function listFeeSchedules(session: AppSession): Promise<FeeSchedule[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("fee_schedules").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));

  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    achDebitFeeCents: row.ach_debit_fee_cents,
    achCreditFeeCents: row.ach_credit_fee_cents,
    cardIssuanceFeeCents: row.card_issuance_fee_cents,
    webhookEventFeeCents: row.webhook_event_fee_cents,
    revenueShareBps: row.revenue_share_bps,
  }));
}

export async function listMemberships(session: AppSession): Promise<Array<{ membership: PartnerMembership; profile: Profile | null }>> {
  const supabase = await getSupabaseOrThrow();
  const membershipPartnerIds = accessiblePartnerIds(session);
  const query = supabase.from("partner_memberships").select("*");
  const { data: memberships } =
    isAdmin(session) && membershipPartnerIds.length === 0
      ? await query
      : await query.in("partner_id", membershipPartnerIds);

  const profileIds = requireArray(memberships).map((membership) => membership.profile_id);
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("*").in("id", profileIds)
    : { data: [] };

  return requireArray(memberships).map((membership) => {
    const profile = requireArray(profiles).find((candidate) => candidate.id === membership.profile_id);

    return {
      membership: {
        id: membership.id,
        partnerId: membership.partner_id,
        profileId: membership.profile_id,
        role: membership.role,
        createdAt: membership.created_at,
      },
      profile: profile
        ? {
            id: profile.id,
            fullName: profile.full_name,
            email: profile.email,
            role: profile.role,
            title: profile.title ?? "",
          }
        : null,
    };
  });
}

export async function listEndUsers(session: AppSession): Promise<EndUser[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("end_users").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));

  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    legalName: row.legal_name,
    dob: row.dob,
    maskedSsn: row.masked_ssn,
    email: row.email,
    phone: row.phone ?? "",
    address: JSON.stringify(row.address),
    kycStatus: row.kyc_status,
    riskFlags: row.risk_flags,
    createdAt: row.created_at,
  }));
}

export async function listAccounts(session: AppSession): Promise<Account[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("accounts").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));

  const balances = await fetchBalancesForAccounts(requireArray(data).map((account) => account.id));

  return requireArray(data).map((row) => {
    const balance = balances.get(row.id);
    return {
      id: row.id,
      partnerId: row.partner_id,
      endUserId: row.end_user_id,
      type: row.type,
      status: row.status,
      nickname: row.nickname,
      routingNumber: row.routing_number,
      maskedAccountNumber: `****${row.account_number_token.slice(-4)}`,
      availableLimitCents: row.available_limit_cents,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      balances: {
        available: balance?.available_cents ?? 0,
        pending: balance?.pending_cents ?? 0,
        ledger: balance?.ledger_cents ?? 0,
      },
      metadata: jsonObject(row.metadata),
    };
  });
}

export async function listBeneficiaries(session: AppSession): Promise<Beneficiary[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("beneficiaries").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));

  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    accountHolderName: row.account_holder_name,
    routingNumber: row.routing_number,
    maskedAccountNumber: row.masked_account_number,
    bankName: row.bank_name,
  }));
}

export async function getAccountDetail(session: AppSession, accountId: string) {
  const supabase = await getSupabaseOrThrow();
  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .maybeSingle();

  if (!account) {
    return null;
  }

  if (!isAdmin(session) && !accessiblePartnerIds(session).includes(account.partner_id)) {
    return null;
  }

  const { data: balance } = await supabase.from("balances").select("*").eq("account_id", accountId).maybeSingle();
  const { data: endUser } = await supabase.from("end_users").select("*").eq("id", account.end_user_id).maybeSingle();
  const { data: cards } = await supabase.from("cards").select("*").eq("account_id", accountId).order("created_at", { ascending: false });
  const { data: transfers } = await supabase.from("transfers").select("*").eq("account_id", accountId).order("created_at", { ascending: false });
  const { data: transactions } = await supabase.from("transactions").select("*").eq("account_id", accountId).order("created_at", { ascending: false });

  return {
    account: {
      id: account.id,
      partnerId: account.partner_id,
      endUserId: account.end_user_id,
      type: account.type,
      status: account.status,
      nickname: account.nickname,
      routingNumber: account.routing_number,
      maskedAccountNumber: `****${account.account_number_token.slice(-4)}`,
      availableLimitCents: account.available_limit_cents,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
      balances: {
        available: balance?.available_cents ?? 0,
        pending: balance?.pending_cents ?? 0,
        ledger: balance?.ledger_cents ?? 0,
      },
      metadata: jsonObject(account.metadata),
    } satisfies Account,
    endUser: endUser
      ? ({
          id: endUser.id,
          partnerId: endUser.partner_id,
          legalName: endUser.legal_name,
          dob: endUser.dob,
          maskedSsn: endUser.masked_ssn,
          email: endUser.email,
          phone: endUser.phone ?? "",
          address: JSON.stringify(endUser.address),
          kycStatus: endUser.kyc_status,
          riskFlags: endUser.risk_flags,
          createdAt: endUser.created_at,
        } satisfies EndUser)
      : null,
    cards: requireArray(cards).map(mapCard),
    transfers: requireArray(transfers).map(mapTransfer),
    transactions: requireArray(transactions).map(mapTransaction),
  };
}

function mapTransaction(row: TableRow<"transactions">): TransactionRecord {
  return {
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    createdAt: row.created_at,
    amountCents: row.amount_cents,
    status: row.status,
    direction: row.direction,
    rail: row.rail,
    description: row.description,
    merchant: row.merchant ?? "Sandbox merchant",
    location: row.location ?? "N/A",
    mcc: row.mcc ?? "0000",
    riskScore: row.risk_score ?? 0,
    riskAction: row.risk_action ?? "allow",
    explainability: Array.isArray(row.explainability) ? (row.explainability as TransactionRecord["explainability"]) : [],
  };
}

function mapTransfer(row: TableRow<"transfers">): Transfer {
  return {
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    beneficiaryId: row.beneficiary_id ?? "",
    amountCents: row.amount_cents,
    direction: row.direction,
    speed: row.speed,
    status: row.status,
    idempotencyKey: row.idempotency_key,
    reasonCode: row.reason_code ?? undefined,
    createdAt: row.created_at,
    settlementDate: row.settlement_date ?? format(new Date(), "yyyy-MM-dd"),
  };
}

function mapCard(row: TableRow<"cards">): Card {
  const spendingControls = jsonObject(row.spending_controls);
  return {
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    cardholderName: row.cardholder_name,
    maskedPan: row.masked_pan,
    lastFour: row.last_four,
    expiry: row.expiry,
    network: row.network,
    status: row.status,
    spendingControls: {
      dailyLimitCents: Number(spendingControls.dailyLimitCents ?? 0),
      transactionLimitCents: Number(spendingControls.transactionLimitCents ?? 0),
      merchantCategoryAllowlist: Array.isArray(spendingControls.merchantCategoryAllowlist)
        ? (spendingControls.merchantCategoryAllowlist as string[])
        : [],
    },
    createdAt: row.created_at,
  };
}

export async function listTransactions(session: AppSession): Promise<TransactionRecord[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("transactions").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map(mapTransaction);
}

export async function listTransfers(session: AppSession): Promise<Transfer[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("transfers").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map(mapTransfer);
}

export async function listCards(session: AppSession): Promise<Card[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("cards").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map(mapCard);
}

export async function getCardDetail(session: AppSession, cardId: string): Promise<Card | null> {
  const supabase = await getSupabaseOrThrow();
  const { data } = await supabase.from("cards").select("*").eq("id", cardId).maybeSingle();
  if (!data) return null;
  if (!isAdmin(session) && !accessiblePartnerIds(session).includes(data.partner_id)) return null;
  return mapCard(data);
}

export async function listKycCases(session: AppSession): Promise<KycCase[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("kyc_cases").select("*").order("updated_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    endUserId: row.end_user_id,
    status: row.status,
    providerDecision: row.provider_decision,
    ofacFlag: row.ofac_flag,
    pepFlag: row.pep_flag,
    reasons: row.reasons,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function listComplianceCases(): Promise<ComplianceCase[]> {
  const supabase = await getSupabaseOrThrow();
  const { data } = await supabase.from("compliance_cases").select("*").order("updated_at", { ascending: false });
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    type: row.type,
    severity: row.severity,
    status: row.status,
    subject: row.subject,
    assignedTo: row.assigned_to ?? "",
    createdAt: row.created_at,
  }));
}

export async function listFraudAlerts(session: AppSession): Promise<FraudAlert[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("fraud_alerts").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    transactionId: row.transaction_id ?? "",
    score: row.score,
    action: row.action,
    status: row.status,
    summary: row.summary,
    createdAt: row.created_at,
  }));
}

export async function listRiskRules() {
  const supabase = await getSupabaseOrThrow();
  const { data } = await supabase.from("risk_rules").select("*").order("threshold", { ascending: true });
  return requireArray(data);
}

export async function getUsageSummary(session: AppSession) {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("usage_events").select("*");
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data);
}

export async function getPartnerSettings(session: AppSession) {
  const partners = await listPartners(session);
  return partners[0] ?? null;
}

export async function listWebhooks(session: AppSession): Promise<WebhookRecord[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("webhooks").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    endpoint: row.endpoint,
    secretPreview: row.secret_hash.slice(0, 10),
    subscribedEvents: row.subscribed_events,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function listWebhookDeliveries(session: AppSession): Promise<WebhookDelivery[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("webhook_deliveries").select("*");
  const { data } = isAdmin(session)
    ? await query.order("last_attempt_at", { ascending: false })
    : await query.in("partner_id", accessiblePartnerIds(session)).order("last_attempt_at", { ascending: false });
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    webhookId: row.webhook_id,
    eventType: row.event_type,
    attemptCount: row.attempt_count,
    lastResponseCode: row.last_response_code ?? 0,
    lastAttemptAt: row.last_attempt_at ?? "",
    status: row.status,
  }));
}

export async function listApiKeys(session: AppSession): Promise<ApiKeyRecord[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("api_keys").select("*").is("revoked_at", null).order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    name: row.name,
    prefix: row.prefix,
    scopes: row.scopes,
    lastUsedAt: row.last_used_at ?? "Never",
    createdAt: row.created_at,
  }));
}

export async function listNotifications(session: AppSession): Promise<NotificationRecord[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("notifications").select("*").order("created_at", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    type: row.event_type as NotificationRecord["type"],
    title: row.title,
    body: row.body,
    read: row.is_read,
    createdAt: row.created_at,
  }));
}

export async function listStatements(session: AppSession): Promise<StatementRecord[]> {
  const supabase = await getSupabaseOrThrow();
  const query = supabase.from("statements").select("*").order("month", { ascending: false });
  const { data } = isAdmin(session)
    ? await query
    : await query.in("partner_id", accessiblePartnerIds(session));
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    month: row.month,
    openingBalanceCents: row.opening_balance_cents,
    closingBalanceCents: row.closing_balance_cents,
    transactionCount: row.transaction_count,
  }));
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  const supabase = await getSupabaseOrThrow();
  const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
  return requireArray(data).map((row) => ({
    id: row.id,
    partnerId: row.partner_id ?? undefined,
    actor: row.actor,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    beforeSummary: row.before_summary ?? "",
    afterSummary: row.after_summary ?? "",
    createdAt: row.created_at,
  }));
}

export async function buildMetrics(session: AppSession) {
  const [partners, accounts, transactions, transfers, cards, alerts, kycCases] = await Promise.all([
    listPartners(session),
    listAccounts(session),
    listTransactions(session),
    listTransfers(session),
    listCards(session),
    listFraudAlerts(session),
    listKycCases(session),
  ]);

  const achVolume = transfers.reduce((sum, item) => sum + item.amountCents, 0);
  const activeAccounts = accounts.filter((account) => account.status === "active").length;
  const pendingKyc = kycCases.filter((item) => item.status !== "approved" && item.status !== "rejected").length;

  return [
    { label: "Total Partners", value: partners.length, detail: "Multi-tenant organizations onboarded" },
    { label: "Active Accounts", value: activeAccounts, detail: "Accounts available for transactions" },
    { label: "Total Transactions", value: transactions.length, detail: "Across ACH, cards, and adjustments" },
    { label: "ACH Volume", value: achVolume, detail: "Sandbox transfer value" },
    { label: "Cards Issued", value: cards.length, detail: "Virtual cards in circulation" },
    { label: "Flagged Alerts", value: alerts.filter((item) => item.status !== "resolved").length, detail: "Fraud cases pending action" },
    { label: "Pending KYC Reviews", value: pendingKyc, detail: "Open KYC workflow items" },
  ];
}
