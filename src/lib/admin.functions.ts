import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

const reviewStatus = z.enum(["approved", "rejected", "pending"]);

// ---------- Overview ----------
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [members, pendingKyc, pendingLoans, openFraud] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("kyc_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("loan_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("fraud_flags").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    const { data: recentLogs } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);
    return {
      members: members.count ?? 0,
      pendingKyc: pendingKyc.count ?? 0,
      pendingLoans: pendingLoans.count ?? 0,
      openFraud: openFraud.count ?? 0,
      recentLogs: recentLogs ?? [],
    };
  });

// ---------- Members ----------
export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
  });

export const setMemberStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; status: string }) =>
    z.object({ userId: z.string().uuid(), status: z.enum(["pending", "verified", "suspended"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ member_status: data.status })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "update_member_status",
      entityType: "profiles",
      entityId: data.userId,
      details: { status: data.status },
    });
    return { ok: true };
  });

export const setMemberBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; balance: number }) =>
    z.object({ userId: z.string().uuid(), balance: z.number().min(0).max(1_000_000_000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ member_balance: data.balance })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "update_member_balance",
      entityType: "profiles",
      entityId: data.userId,
      details: { balance: data.balance },
    });
    return { ok: true };
  });

// ---------- KYC ----------
export const listKyc = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("kyc_submissions")
      .select("*, profiles(full_name, phone, email)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const reviewKyc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string; notes?: string }) =>
    z.object({ id: z.string().uuid(), status: reviewStatus, notes: z.string().max(1000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("kyc_submissions")
      .update({
        status: data.status,
        reviewer_notes: data.notes ?? null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("user_id")
      .single();
    if (error) throw new Error(error.message);
    if (data.status === "approved" && row?.user_id) {
      await supabaseAdmin.from("profiles").update({ member_status: "verified" }).eq("id", row.user_id);
    }
    await logAudit({
      actorId: context.userId,
      action: "review_kyc",
      entityType: "kyc_submissions",
      entityId: data.id,
      details: { status: data.status },
    });
    return { ok: true };
  });

// ---------- Loans ----------
export const listLoans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .select("*, profiles(full_name, phone, email, member_balance)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const reviewLoan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string; notes?: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["approved", "rejected", "pending", "disbursed"]),
        notes: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("loan_applications")
      .update({
        status: data.status,
        reviewer_notes: data.notes ?? null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "review_loan",
      entityType: "loan_applications",
      entityId: data.id,
      details: { status: data.status },
    });
    return { ok: true };
  });

// ---------- Fraud Flags ----------
export const listFraudFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("fraud_flags")
      .select("*, profiles(full_name, phone, email)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createFraudFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; reason: string; severity: string }) =>
    z
      .object({
        userId: z.string().uuid(),
        reason: z.string().min(3).max(500),
        severity: z.enum(["low", "medium", "high"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("fraud_flags")
      .insert({
        user_id: data.userId,
        reason: data.reason,
        severity: data.severity,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "create_fraud_flag",
      entityType: "fraud_flags",
      entityId: row?.id,
      details: { reason: data.reason, severity: data.severity },
    });
    return { ok: true };
  });

export const resolveFraudFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "resolved", "dismissed"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const resolved = data.status !== "open";
    const { error } = await supabaseAdmin
      .from("fraud_flags")
      .update({
        status: data.status,
        resolved_by: resolved ? context.userId : null,
        resolved_at: resolved ? new Date().toISOString() : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "resolve_fraud_flag",
      entityType: "fraud_flags",
      entityId: data.id,
      details: { status: data.status },
    });
    return { ok: true };
  });

// ---------- Audit Logs ----------
export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Admin bootstrap (first user becomes admin if none exists) ----------
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_admin_if_none");
    if (error) throw new Error(error.message);
    return { claimed: data === true };
  });
