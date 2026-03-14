export type AppRole =
  | "platform_admin"
  | "compliance_admin"
  | "partner_admin"
  | "partner_ops"
  | "partner_developer"
  | "end_user";

export type PartnerStatus = "active" | "pending" | "suspended";
export type EnvironmentMode = "sandbox" | "live";
export type SubscriptionTier = "starter" | "growth" | "enterprise";
export type KycStatus = "pending" | "under_review" | "approved" | "rejected" | "needs_info";
export type AccountType = "checking" | "savings" | "business_checking";
export type AccountStatus = "pending" | "active" | "suspended" | "frozen" | "closed";
export type TransferStatus =
  | "created"
  | "pending"
  | "submitted"
  | "settled"
  | "failed"
  | "returned"
  | "reversed";
export type CardStatus = "requested" | "active" | "locked" | "replaced" | "closed";
export type NotificationType =
  | "kyc.updated"
  | "transfer.failed"
  | "webhook.delivery_failed"
  | "card.updated"
  | "fraud.alert.created";
export type FraudAction = "allow" | "flag" | "review" | "decline";

export interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  logoText: string;
}

export interface FeeSchedule {
  id: string;
  partnerId: string;
  achDebitFeeCents: number;
  achCreditFeeCents: number;
  cardIssuanceFeeCents: number;
  webhookEventFeeCents: number;
  revenueShareBps: number;
}

export interface Partner {
  id: string;
  slug: string;
  name: string;
  status: PartnerStatus;
  environmentMode: EnvironmentMode;
  plan: SubscriptionTier;
  branding: BrandingSettings;
  webhookUrl: string;
  webhookSecretPreview: string;
  rateLimitRpm: number;
  feeScheduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  title: string;
}

export interface PartnerMembership {
  id: string;
  partnerId: string;
  profileId: string;
  role: AppRole;
  createdAt: string;
}

export interface EndUser {
  id: string;
  partnerId: string;
  legalName: string;
  dob: string;
  maskedSsn: string;
  email: string;
  phone: string;
  address: string;
  kycStatus: KycStatus;
  riskFlags: string[];
  createdAt: string;
}

export interface Balance {
  available: number;
  pending: number;
  ledger: number;
}

export interface Account {
  id: string;
  partnerId: string;
  endUserId: string;
  type: AccountType;
  status: AccountStatus;
  nickname: string;
  routingNumber: string;
  maskedAccountNumber: string;
  availableLimitCents: number;
  createdAt: string;
  updatedAt: string;
  balances: Balance;
  metadata?: Record<string, unknown>;
}

export interface TransactionRiskFactor {
  key: string;
  label: string;
  value: number;
  weight: number;
  reason: string;
}

export interface TransactionRecord {
  id: string;
  partnerId: string;
  accountId: string;
  createdAt: string;
  amountCents: number;
  status: "pending" | "settled" | "failed" | "returned";
  direction: "credit" | "debit";
  rail: "ach" | "card" | "adjustment";
  description: string;
  merchant: string;
  location: string;
  mcc: string;
  riskScore: number;
  riskAction: FraudAction;
  explainability: TransactionRiskFactor[];
}

export interface Beneficiary {
  id: string;
  partnerId: string;
  accountHolderName: string;
  routingNumber: string;
  maskedAccountNumber: string;
  bankName: string;
}

export interface Transfer {
  id: string;
  partnerId: string;
  accountId: string;
  beneficiaryId: string;
  amountCents: number;
  direction: "credit" | "debit";
  speed: "same_day" | "next_day";
  status: TransferStatus;
  idempotencyKey: string;
  reasonCode?: string;
  createdAt: string;
  settlementDate: string;
}

export interface Card {
  id: string;
  partnerId: string;
  accountId: string;
  cardholderName: string;
  maskedPan: string;
  lastFour: string;
  expiry: string;
  network: "VISA" | "MASTERCARD";
  status: CardStatus;
  spendingControls: {
    dailyLimitCents: number;
    transactionLimitCents: number;
    merchantCategoryAllowlist: string[];
  };
  createdAt: string;
}

export interface KycDocument {
  id: string;
  partnerId: string;
  endUserId: string;
  type: "drivers_license" | "passport" | "utility_bill";
  storagePath: string;
  uploadedAt: string;
}

export interface KycCase {
  id: string;
  partnerId: string;
  endUserId: string;
  status: KycStatus;
  providerDecision: "pass" | "fail" | "review";
  ofacFlag: boolean;
  pepFlag: boolean;
  reasons: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCase {
  id: string;
  partnerId: string;
  type: "sar" | "ctr" | "aml_alert" | "ofac";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "under_review" | "escalated" | "closed" | "filed";
  subject: string;
  assignedTo: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  partnerId: string;
  transactionId: string;
  score: number;
  action: FraudAction;
  status: "open" | "reviewing" | "resolved";
  summary: string;
  createdAt: string;
}

export interface ApiKeyRecord {
  id: string;
  partnerId: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string;
  createdAt: string;
}

export interface WebhookRecord {
  id: string;
  partnerId: string;
  endpoint: string;
  secretPreview: string;
  subscribedEvents: string[];
  status: "healthy" | "degraded";
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  partnerId: string;
  webhookId: string;
  eventType: string;
  attemptCount: number;
  lastResponseCode: number;
  lastAttemptAt: string;
  status: "delivered" | "failed" | "retrying";
}

export interface AuditLog {
  id: string;
  partnerId?: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeSummary: string;
  afterSummary: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  partnerId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface StatementRecord {
  id: string;
  partnerId: string;
  accountId: string;
  month: string;
  openingBalanceCents: number;
  closingBalanceCents: number;
  transactionCount: number;
}

export interface RiskRule {
  id: string;
  name: string;
  threshold: number;
  action: FraudAction;
}

export interface UsageEvent {
  id: string;
  partnerId: string;
  metric: string;
  value: number;
  createdAt: string;
}
