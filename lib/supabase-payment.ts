import { createClient } from "@supabase/supabase-js";

export interface PaymentTransactionRecord {
  id: string;
  amount: number;
  qris_url: string;
  mayar_qris_id: string | null;
  status: "pending" | "paid" | "expired" | "cancelled";
  export_type: string;
  export_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  expires_at: string;
  ip_address: string | null;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL is not defined in environment variables");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables");
  }

  return { url, serviceRoleKey };
}

function getSupabaseAdmin() {
  const { url, serviceRoleKey } = getSupabaseConfig();
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function createPaymentTransaction(input: {
  amount: number;
  qrisUrl: string;
  mayarQrisId: string;
  exportType: string;
  exportMetadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("payment_transactions")
    .insert({
      amount: input.amount,
      qris_url: input.qrisUrl,
      mayar_qris_id: input.mayarQrisId,
      status: "pending",
      export_type: input.exportType,
      export_metadata: input.exportMetadata ?? null,
      created_at: now,
      updated_at: now,
      paid_at: null,
      expires_at: expiresAt,
      ip_address: input.ipAddress ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create payment transaction: ${error.message}`);
  }

  return data as PaymentTransactionRecord;
}

export async function getPaymentTransactionById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch payment transaction: ${error.message}`);
  }

  return data as PaymentTransactionRecord;
}

export async function updatePaymentTransactionStatus(
  id: string,
  status: PaymentTransactionRecord["status"]
) {
  const supabase = getSupabaseAdmin();
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "paid") {
    updates.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("payment_transactions")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update payment transaction: ${error.message}`);
  }

  return data as PaymentTransactionRecord;
}

export async function findPendingTransactionsByAmount(amount: number, sinceIso: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("status", "pending")
    .eq("amount", amount)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to search payment transactions: ${error.message}`);
  }

  return (data || []) as PaymentTransactionRecord[];
}

export async function findPendingTransactionsByMayarQrisId(qrisId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("status", "pending")
    .eq("mayar_qris_id", qrisId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to search payment transactions by Mayar QRIS ID: ${error.message}`);
  }

  return (data || []) as PaymentTransactionRecord[];
}
