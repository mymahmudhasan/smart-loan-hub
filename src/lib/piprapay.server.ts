// Server-only PipraPay gateway client. The `.server.ts` suffix keeps the
// API key out of any client bundle. Read env inside functions (Workers bind
// env per-request).
import process from "node:process";

export const PIPRAPAY_BASE_URL = "https://pay.auratradeai.tech";

function getApiKey(): string {
  const key = process.env.PAYMENT_GATEWAY_API_KEY;
  if (!key) throw new Error("PAYMENT_GATEWAY_API_KEY is not configured");
  return key;
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
  const res = await fetch(`${PIPRAPAY_BASE_URL}/api/create-charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "mh-piprapay-api-key": getApiKey(),
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
  const res = await fetch(`${PIPRAPAY_BASE_URL}/api/verify-payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "mh-piprapay-api-key": getApiKey(),
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
export function isValidWebhookKey(headerKey: string | null): boolean {
  if (!headerKey) return false;
  const expected = getApiKey();
  if (headerKey.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= headerKey.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
