// Server-only PipraPay gateway client. The `.server.ts` suffix keeps the
// API key out of any client bundle. The active key + base URL are read from
// the database (admin-managed) at request time, falling back to the
// PAYMENT_GATEWAY_API_KEY secret and the default URL when unset.
import process from "node:process";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const DEFAULT_PIPRAPAY_BASE_URL = "https://pay.auratradeai.tech";

export type GatewaySettings = {
  apiKey: string;
  baseUrl: string;
  isActive: boolean;
};

// Reads the admin-managed gateway settings from the DB, with env fallbacks.
export async function getGatewaySettings(): Promise<GatewaySettings> {
  let dbKey: string | null = null;
  let dbUrl: string | null = null;
  let isActive = true;

  const { data } = await supabaseAdmin
    .from("payment_gateway_config")
    .select("api_key, base_url, is_active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (data) {
    dbKey = (data.api_key as string | null) ?? null;
    dbUrl = (data.base_url as string | null) ?? null;
    isActive = Boolean(data.is_active);
  }

  const apiKey = (dbKey && dbKey.trim()) || process.env.PAYMENT_GATEWAY_API_KEY || "";
  const baseUrl = (dbUrl && dbUrl.trim()) || DEFAULT_PIPRAPAY_BASE_URL;

  if (!apiKey) {
    throw new Error("Payment gateway API key is not configured");
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/$/, ""), isActive };
}

export type CreateChargeInput = {
  full_name: string;
  email_mobile: string;
  amount: string;
  metadata: Record<string, unknown>;
  redirect_url: string;
  return_type: "GET" | "POST";
  cancel_url: string;
  webhook_url: string;
  currency: string;
};

export type CreateChargeResult = {
  status: boolean;
  pp_id?: string | number;
  pp_url?: string;
  message?: string;
};

export async function createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
  const { apiKey, baseUrl, isActive } = await getGatewaySettings();
  if (!isActive) {
    throw new Error("Online payment gateway is currently disabled");
  }
  const res = await fetch(`${baseUrl}/api/create-charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "mh-piprapay-api-key": apiKey,
    },
    body: JSON.stringify(input),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json?.status !== true) {
    const msg =
      (json?.error as { message?: string } | undefined)?.message ??
      (json?.message as string | undefined) ??
      "Failed to create payment charge";
    throw new Error(msg);
  }
  return json as CreateChargeResult;
}

export type VerifyPaymentResult = {
  pp_id?: string;
  amount?: string;
  currency?: string;
  status?: string; // "completed" when paid
  transaction_id?: string;
  payment_method?: string;
  metadata?: Record<string, unknown>;
  message?: string;
};

export async function verifyPayment(ppId: string): Promise<VerifyPaymentResult> {
  const { apiKey, baseUrl } = await getGatewaySettings();
  const res = await fetch(`${baseUrl}/api/verify-payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "mh-piprapay-api-key": apiKey,
    },
    body: JSON.stringify({ pp_id: ppId }),
  });
  const json = (await res.json().catch(() => ({}))) as VerifyPaymentResult;
  if (!res.ok) {
    throw new Error(json?.message ?? "Failed to verify payment");
  }
  return json;
}

// Constant-time-ish compare of the webhook's API key header against ours.
export async function isValidWebhookKey(headerKey: string | null): Promise<boolean> {
  if (!headerKey) return false;
  const { apiKey: expected } = await getGatewaySettings();
  if (!expected || headerKey.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= headerKey.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
