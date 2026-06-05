import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAudit } from "./admin.server";

// ---------- Member's own account snapshot ----------
export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const [profileR, txR, loansR, activityR] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("loan_applications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("audit_logs")
        .select("*")
        .eq("actor_id", uid)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);
    if (profileR.error) throw new Error(profileR.error.message);
    return {
      profile: profileR.data,
      transactions: txR.data ?? [],
      loans: loansR.data ?? [],
      activity: activityR.data ?? [],
    };
  });

// ---------- Member requests a money movement ----------
export const requestTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { type: string; amount: number; method: string }) =>
    z
      .object({
        type: z.enum(["deposit", "withdrawal", "emi_payment"]),
        amount: z.number().positive().max(1_000_000_000),
        method: z.enum(["bkash", "nagad", "bank"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: context.userId,
        type: data.type as "deposit" | "withdrawal" | "emi_payment",
        amount: data.amount,
        method: data.method,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: `member_${data.type}_request`,
      entityType: "transactions",
      entityId: row?.id,
      details: { amount: data.amount, method: data.method },
    });
    return { ok: true };
  });

// ---------- Member submits a loan application ----------
export const submitLoanApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number; months: number; emi: number; purpose?: string }) =>
    z
      .object({
        amount: z.number().positive().max(1_000_000_000),
        months: z.number().int().min(3).max(60),
        emi: z.number().nonnegative(),
        purpose: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await supabaseAdmin
      .from("loan_applications")
      .insert({
        user_id: context.userId,
        amount: data.amount,
        months: data.months,
        emi: data.emi,
        purpose: data.purpose ?? null,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "member_loan_application",
      entityType: "loan_applications",
      entityId: row?.id,
      details: { amount: data.amount, months: data.months },
    });
    return { ok: true };
  });
