// @ts-nocheck
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: ({
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          role:
            | "platform_admin"
            | "compliance_admin"
            | "partner_admin"
            | "partner_ops"
            | "partner_developer"
            | "end_user";
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          full_name: string;
          email: string;
          role: Database["public"]["Tables"]["profiles"]["Row"]["role"];
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      partners: {
        Row: {
          id: string;
          slug: string;
          name: string;
          status: "pending" | "active" | "suspended";
          environment_mode: "sandbox" | "live";
          branding: Json;
          webhook_config: Json;
          rate_limit_rpm: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partners"]["Row"]> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
      };
      partner_memberships: {
        Row: {
          id: string;
          partner_id: string;
          profile_id: string;
          role: Database["public"]["Tables"]["profiles"]["Row"]["role"];
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_memberships"]["Row"]> & {
          partner_id: string;
          profile_id: string;
          role: Database["public"]["Tables"]["profiles"]["Row"]["role"];
        };
        Update: Partial<Database["public"]["Tables"]["partner_memberships"]["Row"]>;
      };
      fee_schedules: {
        Row: {
          id: string;
          partner_id: string;
          subscription_tier: "starter" | "growth" | "enterprise";
          ach_debit_fee_cents: number;
          ach_credit_fee_cents: number;
          card_issuance_fee_cents: number;
          webhook_event_fee_cents: number;
          revenue_share_bps: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["fee_schedules"]["Row"]> & { partner_id: string };
        Update: Partial<Database["public"]["Tables"]["fee_schedules"]["Row"]>;
      };
      api_keys: {
        Row: {
          id: string;
          partner_id: string;
          name: string;
          prefix: string;
          key_hash: string;
          scopes: string[];
          revoked_at: string | null;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["api_keys"]["Row"]> & {
          partner_id: string;
          name: string;
          prefix: string;
          key_hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["api_keys"]["Row"]>;
      };
      end_users: {
        Row: {
          id: string;
          partner_id: string;
          legal_name: string;
          dob: string;
          masked_ssn: string;
          email: string;
          phone: string | null;
          address: Json;
          kyc_status: "pending" | "under_review" | "approved" | "rejected" | "needs_info";
          risk_flags: string[];
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["end_users"]["Row"]> & {
          partner_id: string;
          legal_name: string;
          dob: string;
          masked_ssn: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["end_users"]["Row"]>;
      };
      accounts: {
        Row: {
          id: string;
          partner_id: string;
          end_user_id: string;
          type: "checking" | "savings" | "business_checking";
          status: "pending" | "active" | "suspended" | "frozen" | "closed";
          nickname: string;
          routing_number: string;
          account_number_token: string;
          available_limit_cents: number;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["accounts"]["Row"]> & {
          partner_id: string;
          end_user_id: string;
          type: Database["public"]["Tables"]["accounts"]["Row"]["type"];
          nickname: string;
          routing_number: string;
          account_number_token: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Row"]>;
      };
      balances: {
        Row: {
          account_id: string;
          partner_id: string;
          available_cents: number;
          pending_cents: number;
          ledger_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["balances"]["Row"]> & {
          account_id: string;
          partner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["balances"]["Row"]>;
      };
      beneficiaries: {
        Row: {
          id: string;
          partner_id: string;
          account_holder_name: string;
          routing_number: string;
          masked_account_number: string;
          bank_name: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["beneficiaries"]["Row"]> & {
          partner_id: string;
          account_holder_name: string;
          routing_number: string;
          masked_account_number: string;
          bank_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["beneficiaries"]["Row"]>;
      };
      transactions: {
        Row: {
          id: string;
          partner_id: string;
          account_id: string;
          amount_cents: number;
          currency: string;
          status: "pending" | "settled" | "failed" | "returned";
          direction: "credit" | "debit";
          rail: "ach" | "card" | "adjustment";
          description: string;
          merchant: string | null;
          location: string | null;
          mcc: string | null;
          risk_score: number | null;
          risk_action: "allow" | "flag" | "review" | "decline" | null;
          explainability: Json;
          transfer_id: string | null;
          card_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["transactions"]["Row"]> & {
          partner_id: string;
          account_id: string;
          amount_cents: number;
          status: Database["public"]["Tables"]["transactions"]["Row"]["status"];
          direction: Database["public"]["Tables"]["transactions"]["Row"]["direction"];
          rail: Database["public"]["Tables"]["transactions"]["Row"]["rail"];
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
      };
      transfers: {
        Row: {
          id: string;
          partner_id: string;
          account_id: string;
          beneficiary_id: string | null;
          amount_cents: number;
          direction: "credit" | "debit";
          speed: "same_day" | "next_day";
          status: "created" | "pending" | "submitted" | "settled" | "failed" | "returned" | "reversed";
          idempotency_key: string;
          reason_code: string | null;
          settlement_date: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["transfers"]["Row"]> & {
          partner_id: string;
          account_id: string;
          amount_cents: number;
          direction: Database["public"]["Tables"]["transfers"]["Row"]["direction"];
          speed: Database["public"]["Tables"]["transfers"]["Row"]["speed"];
          idempotency_key: string;
        };
        Update: Partial<Database["public"]["Tables"]["transfers"]["Row"]>;
      };
      cards: {
        Row: {
          id: string;
          partner_id: string;
          account_id: string;
          cardholder_name: string;
          masked_pan: string;
          last_four: string;
          expiry: string;
          network: "VISA" | "MASTERCARD";
          status: "requested" | "active" | "locked" | "replaced" | "closed";
          spending_controls: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cards"]["Row"]> & {
          partner_id: string;
          account_id: string;
          cardholder_name: string;
          masked_pan: string;
          last_four: string;
          expiry: string;
          network: "VISA" | "MASTERCARD";
        };
        Update: Partial<Database["public"]["Tables"]["cards"]["Row"]>;
      };
      kyc_cases: {
        Row: {
          id: string;
          partner_id: string;
          end_user_id: string;
          status: "pending" | "under_review" | "approved" | "rejected" | "needs_info";
          provider_decision: "pass" | "fail" | "review";
          ofac_flag: boolean;
          pep_flag: boolean;
          reasons: string[];
          notes: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["kyc_cases"]["Row"]> & {
          partner_id: string;
          end_user_id: string;
          provider_decision: "pass" | "fail" | "review";
        };
        Update: Partial<Database["public"]["Tables"]["kyc_cases"]["Row"]>;
      };
      kyc_documents: {
        Row: {
          id: string;
          partner_id: string;
          end_user_id: string;
          document_type: string;
          storage_path: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["kyc_documents"]["Row"]> & {
          partner_id: string;
          end_user_id: string;
          document_type: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["kyc_documents"]["Row"]>;
      };
      compliance_cases: {
        Row: {
          id: string;
          partner_id: string;
          type: "sar" | "ctr" | "aml_alert" | "ofac";
          severity: "low" | "medium" | "high" | "critical";
          status: "open" | "under_review" | "escalated" | "closed" | "filed";
          subject: string;
          assigned_to: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["compliance_cases"]["Row"]> & {
          partner_id: string;
          type: Database["public"]["Tables"]["compliance_cases"]["Row"]["type"];
          severity: Database["public"]["Tables"]["compliance_cases"]["Row"]["severity"];
          status: Database["public"]["Tables"]["compliance_cases"]["Row"]["status"];
          subject: string;
        };
        Update: Partial<Database["public"]["Tables"]["compliance_cases"]["Row"]>;
      };
      fraud_alerts: {
        Row: {
          id: string;
          partner_id: string;
          transaction_id: string | null;
          score: number;
          action: "allow" | "flag" | "review" | "decline";
          status: "open" | "reviewing" | "resolved";
          summary: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["fraud_alerts"]["Row"]> & {
          partner_id: string;
          score: number;
          action: Database["public"]["Tables"]["fraud_alerts"]["Row"]["action"];
          status: Database["public"]["Tables"]["fraud_alerts"]["Row"]["status"];
          summary: string;
        };
        Update: Partial<Database["public"]["Tables"]["fraud_alerts"]["Row"]>;
      };
      webhooks: {
        Row: {
          id: string;
          partner_id: string;
          endpoint: string;
          secret_hash: string;
          subscribed_events: string[];
          status: "healthy" | "degraded";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["webhooks"]["Row"]> & {
          partner_id: string;
          endpoint: string;
          secret_hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["webhooks"]["Row"]>;
      };
      webhook_deliveries: {
        Row: {
          id: string;
          partner_id: string;
          webhook_id: string;
          event_type: string;
          attempt_count: number;
          last_response_code: number | null;
          last_attempt_at: string | null;
          status: "delivered" | "failed" | "retrying";
          metadata: Json;
        };
        Insert: Partial<Database["public"]["Tables"]["webhook_deliveries"]["Row"]> & {
          partner_id: string;
          webhook_id: string;
          event_type: string;
          status: Database["public"]["Tables"]["webhook_deliveries"]["Row"]["status"];
        };
        Update: Partial<Database["public"]["Tables"]["webhook_deliveries"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          partner_id: string | null;
          actor: string;
          action: string;
          entity_type: string;
          entity_id: string;
          before_summary: string | null;
          after_summary: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          actor: string;
          action: string;
          entity_type: string;
          entity_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          partner_id: string;
          event_type: string;
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          partner_id: string;
          event_type: string;
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          partner_id: string;
          tier: "starter" | "growth" | "enterprise";
          status: "active" | "trialing" | "canceled";
          monthly_fee_cents: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          partner_id: string;
          tier: Database["public"]["Tables"]["subscriptions"]["Row"]["tier"];
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
      statements: {
        Row: {
          id: string;
          partner_id: string;
          account_id: string;
          month: string;
          opening_balance_cents: number;
          closing_balance_cents: number;
          transaction_count: number;
          file_path: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["statements"]["Row"]> & {
          partner_id: string;
          account_id: string;
          month: string;
        };
        Update: Partial<Database["public"]["Tables"]["statements"]["Row"]>;
      };
      risk_rules: {
        Row: {
          id: string;
          name: string;
          threshold: number;
          action: "allow" | "flag" | "review" | "decline";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["risk_rules"]["Row"]> & {
          name: string;
          threshold: number;
          action: Database["public"]["Tables"]["risk_rules"]["Row"]["action"];
        };
        Update: Partial<Database["public"]["Tables"]["risk_rules"]["Row"]>;
      };
      usage_events: {
        Row: {
          id: string;
          partner_id: string;
          metric: string;
          value: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["usage_events"]["Row"]> & {
          partner_id: string;
          metric: string;
          value: number;
        };
        Update: Partial<Database["public"]["Tables"]["usage_events"]["Row"]>;
      };
      ledger_entries: {
        Row: {
          id: string;
          partner_id: string;
          account_id: string;
          transaction_id: string | null;
          transfer_id: string | null;
          entry_type: "hold" | "settlement" | "reversal";
          direction: "credit" | "debit";
          amount_cents: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ledger_entries"]["Row"]> & {
          partner_id: string;
          account_id: string;
          entry_type: Database["public"]["Tables"]["ledger_entries"]["Row"]["entry_type"];
          direction: Database["public"]["Tables"]["ledger_entries"]["Row"]["direction"];
          amount_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["ledger_entries"]["Row"]>;
      };
    } & Record<string, { Relationships: [] }>);
    Views: Record<string, never>;
    Functions: {
      create_account_for_partner: {
        Args: {
          p_partner_id: string;
          p_end_user_id: string;
          p_type: "checking" | "savings" | "business_checking";
          p_nickname: string;
          p_actor_id: string | null;
        };
        Returns: string;
      };
      create_transfer_for_partner: {
        Args: {
          p_partner_id: string;
          p_account_id: string;
          p_beneficiary_id: string | null;
          p_amount_cents: number;
          p_direction: "credit" | "debit";
          p_speed: "same_day" | "next_day";
          p_idempotency_key: string;
          p_reason_code: string | null;
          p_risk_score: number | null;
          p_risk_action: "allow" | "flag" | "review" | "decline" | null;
          p_explainability: Json;
          p_actor_id: string | null;
        };
        Returns: string;
      };
      issue_card_for_partner: {
        Args: {
          p_partner_id: string;
          p_account_id: string;
          p_cardholder_name: string;
          p_daily_limit_cents: number;
          p_transaction_limit_cents: number;
          p_allowed_mccs: string[];
          p_actor_id: string | null;
        };
        Returns: string;
      };
      rotate_api_key_for_partner: {
        Args: {
          p_partner_id: string;
          p_name: string;
          p_prefix: string;
          p_key_hash: string;
          p_scopes: string[];
        };
        Returns: string;
      };
      mark_notification_read: {
        Args: { p_notification_id: string; p_is_read: boolean };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
