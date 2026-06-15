import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";
import { DEFAULT_PIPRAPAY_BASE_URL } from "./piprapay.server";

export type GatewayConfigAdmin = {
  id: string | null;
  base_url: string;
  is_active: boolean;
  configured: boolean;
  masked_key: string | null;
  updated_at: string | null;
};

function maskKey(key: string | null): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (!trimmed) return null;
  const last4 = trimmed.slice(-4);
  return `${"•".repeat(Math.min(8, Math.max(4, trimmed.length - 4)))}${last4}`;
}

// ---------- Admin: read gateway config (RBAC enforced, key never returned) ----------
export const getGatewayConfigAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GatewayConfigAdmin> => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("payment_gateway_config")
      .select("id, api_key, base_url, is_active, updated_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const key = (data?.api_key as string | null) ?? null;
    return {
      id: data ? String(data.id) : null,
      base_url: (data?.base_url as string | null) || DEFAULT_PIPRAPAY_BASE_URL,
      is_active: data ? Boolean(data.is_active) : true,
      configured: Boolean(key && key.trim()),
      masked_key: maskKey(key),
      updated_at: data ? String(data.updated_at) : null,
    };
  });

const updateInput = z.object({
  // Empty string means "keep the existing key".
  api_key: z.string().max(300).optional(),
  base_url: z.string().url().max(300),
  is_active: z.boolean(),
});

// ---------- Admin: update gateway config ----------
export const updateGatewayConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: existing } = await supabaseAdmin
      .from("payment_gateway_config")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const newKey = data.api_key?.trim();
    const basePayload: {
      base_url: string;
      is_active: boolean;
      updated_by: string;
      api_key?: string;
    } = {
      base_url: data.base_url.replace(/\/$/, ""),
      is_active: data.is_active,
      updated_by: context.userId,
    };
    // Only overwrite the key when a non-empty value was provided.
    if (newKey) basePayload.api_key = newKey;

    let id = existing?.id as string | undefined;
    if (id) {
      const { error } = await supabaseAdmin
        .from("payment_gateway_config")
        .update(basePayload)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("payment_gateway_config")
        .insert(basePayload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row?.id;
    }

    await logAudit({
      actorId: context.userId,
      action: "update_payment_gateway_config",
      entityType: "payment_gateway_config",
      entityId: id,
      details: {
        base_url: basePayload.base_url,
        is_active: data.is_active,
        api_key_changed: Boolean(newKey),
      },
    });

    return { ok: true, id };
  });
