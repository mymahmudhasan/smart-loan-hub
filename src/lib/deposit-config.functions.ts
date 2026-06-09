import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

export type DepositConfig = {
  id: string;
  bkash_number: string | null;
  nagad_number: string | null;
  bkash_active: boolean;
  nagad_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

function normalize(row: Record<string, unknown> | null): DepositConfig | null {
  if (!row) return null;
  return {
    id: String(row.id),
    bkash_number: row.bkash_number ? String(row.bkash_number) : null,
    nagad_number: row.nagad_number ? String(row.nagad_number) : null,
    bkash_active: Boolean(row.bkash_active),
    nagad_active: Boolean(row.nagad_active),
    updated_by: row.updated_by ? String(row.updated_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

// ---------- Public: read deposit config ----------
export const getDepositConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("deposit_config")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return normalize(data as Record<string, unknown> | null);
});

// ---------- Admin: read deposit config (RBAC enforced) ----------
export const getDepositConfigAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("deposit_config")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return normalize(data as Record<string, unknown> | null);
  });

const depositConfigInput = z.object({
  bkash_number: z.string().max(20).nullable(),
  nagad_number: z.string().max(20).nullable(),
  bkash_active: z.boolean(),
  nagad_active: z.boolean(),
});

// ---------- Admin: update deposit config ----------
export const updateDepositConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => depositConfigInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = {
      bkash_number: data.bkash_number,
      nagad_number: data.nagad_number,
      bkash_active: data.bkash_active,
      nagad_active: data.nagad_active,
      updated_by: context.userId,
    };
    const { data: existing } = await supabaseAdmin
      .from("deposit_config")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let id = existing?.id as string | undefined;
    if (id) {
      const { error } = await supabaseAdmin.from("deposit_config").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("deposit_config")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row?.id;
    }
    await logAudit({
      actorId: context.userId,
      action: "update_deposit_config",
      entityType: "deposit_config",
      entityId: id,
      details: {
        bkash_number: data.bkash_number,
        nagad_number: data.nagad_number,
        bkash_active: data.bkash_active,
        nagad_active: data.nagad_active,
      },
    });
    return { ok: true, id };
  });
