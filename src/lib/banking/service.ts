// @ts-nocheck
import crypto from "node:crypto";

import { scoreTransactionRisk } from "@/lib/risk/engine";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { emitWebhookEvents } from "@/lib/webhooks/events";

function randomToken(prefix: string) {
  return `${prefix}${crypto.randomBytes(8).toString("hex")}`;
}

export async function createAccountFlow(input: {
  partnerId: string;
  endUserId: string;
  type: "checking" | "savings" | "business_checking";
  nickname: string;
  actorProfileId: string | null;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  const { data: accountId, error } = await admin.rpc("create_account_for_partner", {
    p_partner_id: input.partnerId,
    p_end_user_id: input.endUserId,
    p_type: input.type,
    p_nickname: input.nickname,
    p_actor_id: input.actorProfileId,
  });

  if (error || !accountId) {
    throw new Error(error?.message ?? "Unable to create account");
  }

  const [{ data: account }, { data: balance }] = await Promise.all([
    admin.from("accounts").select("*").eq("id", accountId).single(),
    admin.from("balances").select("*").eq("account_id", accountId).single(),
  ]);

  await emitWebhookEvents(input.partnerId, ["account.created"], { accountId });

  return {
    account,
    balance,
  };
}

export async function createTransferFlow(input: {
  partnerId: string;
  accountId: string;
  beneficiaryId: string | null;
  amountCents: number;
  direction: "credit" | "debit";
  speed: "same_day" | "next_day";
  idempotencyKey: string;
  actorProfileId: string | null;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  const { data: account } = await admin.from("accounts").select("status").eq("id", input.accountId).single();

  const risk = scoreTransactionRisk({
    amountCents: input.amountCents,
    velocityCount: 2,
    locationMismatch: input.direction === "debit",
    deviceMismatch: false,
    merchantCategory: "4214",
    accountStatus: account?.status === "frozen" ? "frozen" : "active",
  });

  const reasonCode = account?.status === "frozen" ? "R16: Account frozen or entry restricted" : null;
  const { data: transferId, error } = await admin.rpc("create_transfer_for_partner", {
    p_partner_id: input.partnerId,
    p_account_id: input.accountId,
    p_beneficiary_id: input.beneficiaryId,
    p_amount_cents: input.amountCents,
    p_direction: input.direction,
    p_speed: input.speed,
    p_idempotency_key: input.idempotencyKey,
    p_reason_code: reasonCode,
    p_risk_score: risk.score,
    p_risk_action: risk.action,
    p_explainability: risk.factors,
    p_actor_id: input.actorProfileId,
  });

  if (error || !transferId) {
    throw new Error(error?.message ?? "Unable to create transfer");
  }

  let [{ data: transfer }, { data: transaction }] = await Promise.all([
    admin.from("transfers").select("*").eq("id", transferId).single(),
    admin.from("transactions").select("*").eq("transfer_id", transferId).single(),
  ]);

  if (transfer && transaction && transfer.status !== "failed" && input.speed === "same_day") {
    await Promise.all([
      admin.from("transfers").update({ status: "settled", updated_at: new Date().toISOString() }).eq("id", transferId),
      admin.from("transactions").update({ status: "settled" }).eq("id", transaction.id),
    ]);

    const { data: currentBalance } = await admin.from("balances").select("*").eq("account_id", input.accountId).single();

    if (currentBalance) {
      const signedAmount = input.direction === "credit" ? input.amountCents : -input.amountCents;
      await admin
        .from("balances")
        .update({
          available_cents: currentBalance.available_cents + signedAmount,
          pending_cents: currentBalance.pending_cents - signedAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("account_id", input.accountId);
    }

    await admin.from("ledger_entries").insert({
      partner_id: input.partnerId,
      account_id: input.accountId,
      transaction_id: transaction.id,
      transfer_id: transferId,
      entry_type: "settlement",
      direction: input.direction,
      amount_cents: input.amountCents,
    });

    [{ data: transfer }, { data: transaction }] = await Promise.all([
      admin.from("transfers").select("*").eq("id", transferId).single(),
      admin.from("transactions").select("*").eq("transfer_id", transferId).single(),
    ]);
  }

  const { data: balance } = await admin.from("balances").select("*").eq("account_id", input.accountId).single();

  if (risk.action !== "allow" && transaction) {
    await admin.from("fraud_alerts").insert({
      partner_id: input.partnerId,
      transaction_id: transaction.id,
      score: risk.score,
      action: risk.action,
      status: risk.action === "decline" ? "open" : "reviewing",
      summary: `Transfer ${transferId} scored ${risk.score} and triggered ${risk.action}.`,
    });

    await admin.from("notifications").insert({
      partner_id: input.partnerId,
      event_type: "fraud.alert.created",
      title: "Fraud alert created",
      body: `Transfer ${transferId} scored ${risk.score}.`,
    });
  }

  await emitWebhookEvents(
    input.partnerId,
    transfer?.status === "settled"
      ? ["transfer.created", "transfer.settled"]
      : [transfer?.status === "failed" ? "transfer.failed" : "transfer.created"],
    { transferId, riskScore: risk.score },
  );

  return {
    transfer,
    transaction,
    balance,
    risk,
  };
}

export async function issueCardFlow(input: {
  partnerId: string;
  accountId: string;
  cardholderName: string;
  dailyLimitCents: number;
  actorProfileId: string | null;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  const { data: cardId, error } = await admin.rpc("issue_card_for_partner", {
    p_partner_id: input.partnerId,
    p_account_id: input.accountId,
    p_cardholder_name: input.cardholderName,
    p_daily_limit_cents: input.dailyLimitCents,
    p_transaction_limit_cents: Math.round(input.dailyLimitCents / 4),
    p_allowed_mccs: ["5734", "4112", "5047"],
    p_actor_id: input.actorProfileId,
  });

  if (error || !cardId) {
    throw new Error(error?.message ?? "Unable to issue card");
  }

  const { data: card } = await admin.from("cards").select("*").eq("id", cardId).single();

  await emitWebhookEvents(input.partnerId, ["card.created"], { cardId });

  return {
    card,
  };
}

export async function createWebhookFlow(input: {
  partnerId: string;
  endpoint: string;
  subscribedEvents: string[];
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase service role is not configured");

  const secret = randomToken("whsec_");
  const secretHash = crypto.createHash("sha256").update(secret).digest("hex");
  const { data, error } = await admin
    .from("webhooks")
    .insert({
      partner_id: input.partnerId,
      endpoint: input.endpoint,
      secret_hash: secretHash,
      subscribed_events: input.subscribedEvents,
      status: "healthy",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return { webhook: data, secret };
}

export async function createApiKeyFlow(input: {
  partnerId: string;
  name: string;
  scopes: string[];
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase service role is not configured");

  const secret = randomToken("ns_live_");
  const prefix = secret.slice(0, 12);
  const keyHash = crypto.createHash("sha256").update(secret).digest("hex");

  const { data: id, error } = await admin.rpc("rotate_api_key_for_partner", {
    p_partner_id: input.partnerId,
    p_name: input.name,
    p_prefix: prefix,
    p_key_hash: keyHash,
    p_scopes: input.scopes,
  });

  if (error || !id) throw new Error(error?.message ?? "Unable to create API key");
  return { id, secret, prefix };
}
