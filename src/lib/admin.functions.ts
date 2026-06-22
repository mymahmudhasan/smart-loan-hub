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

// ---------- Per-member dashboard (admin view) ----------
export const getMemberDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const uid = data.userId;
    const [profileR, rolesR, loansR, txR, kycR, fraudR, activityR] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", uid),
      supabaseAdmin
        .from("loan_applications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("fraud_flags")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("audit_logs")
        .select("*")
        .or(`actor_id.eq.${uid},entity_id.eq.${uid}`)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (profileR.error) throw new Error(profileR.error.message);
    return {
      profile: profileR.data,
      roles: (rolesR.data ?? []).map((r) => r.role),
      loans: loansR.data ?? [],
      transactions: txR.data ?? [],
      kyc: kycR.data ?? [],
      fraudFlags: fraudR.data ?? [],
      activity: activityR.data ?? [],
    };
  });

// Admin records a transaction for a member (optionally adjusting their balance).
export const addMemberTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { userId: string; type: string; amount: number; method?: string; note?: string; adjustBalance?: boolean }) =>
      z
        .object({
          userId: z.string().uuid(),
          type: z.enum(["deposit", "withdrawal", "emi_payment", "disbursement", "adjustment"]),
          amount: z.number().positive().max(1_000_000_000),
          method: z.string().max(50).optional(),
          note: z.string().max(500).optional(),
          adjustBalance: z.boolean().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: data.userId,
        type: data.type as "deposit" | "withdrawal" | "emi_payment" | "disbursement" | "adjustment",
        amount: data.amount,
        method: data.method ?? null,
        note: data.note ?? null,
        status: "completed",
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (data.adjustBalance) {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("member_balance")
        .eq("id", data.userId)
        .maybeSingle();
      const cur = Number(prof?.member_balance ?? 0);
      const delta = data.type === "deposit" ? data.amount : -data.amount;
      await supabaseAdmin
        .from("profiles")
        .update({ member_balance: Math.max(0, cur + delta) })
        .eq("id", data.userId);
    }
    await logAudit({
      actorId: context.userId,
      action: `record_${data.type}`,
      entityType: "transactions",
      entityId: row?.id,
      details: { userId: data.userId, amount: data.amount, adjustedBalance: !!data.adjustBalance },
    });
    return { ok: true };
  });

// Admin approves / rejects a pending member transaction request.
export const setTransactionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string; adjustBalance?: boolean }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["completed", "failed", "pending"]),
        adjustBalance: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: tx, error: fetchErr } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!tx) throw new Error("Transaction not found");

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.status === "completed" && data.adjustBalance && tx.status !== "completed") {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("member_balance")
        .eq("id", tx.user_id)
        .maybeSingle();
      const cur = Number(prof?.member_balance ?? 0);
      const delta = tx.type === "deposit" ? Number(tx.amount) : -Number(tx.amount);
      await supabaseAdmin
        .from("profiles")
        .update({ member_balance: Math.max(0, cur + delta) })
        .eq("id", tx.user_id);
    }
    await logAudit({
      actorId: context.userId,
      action: "review_transaction",
      entityType: "transactions",
      entityId: data.id,
      details: { status: data.status, userId: tx.user_id },
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

// Generate short-lived signed URLs so admins can view a member's KYC documents.
export const getKycDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("kyc_submissions")
      .select("nid_number, nid_front_url, nid_back_url, selfie_url, status, reviewer_notes, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("KYC submission not found");

    const sign = async (path: string | null) => {
      if (!path) return null;
      const { data: signed } = await supabaseAdmin.storage
        .from("kyc-documents")
        .createSignedUrl(path, 60 * 10);
      return signed?.signedUrl ?? null;
    };

    const [nidFront, nidBack, selfie] = await Promise.all([
      sign(row.nid_front_url),
      sign(row.nid_back_url),
      sign(row.selfie_url),
    ]);

    return {
      nidNumber: row.nid_number,
      status: row.status,
      reviewerNotes: row.reviewer_notes,
      createdAt: row.created_at,
      nidFront,
      nidBack,
      selfie,
    };
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

// ---------- Account approval / document requests ----------
// Admin asks a member to provide additional documents for the record.
export const requestMemberDocuments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; message: string }) =>
    z.object({ userId: z.string().uuid(), message: z.string().min(2).max(1000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ documents_requested: data.message })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "request_member_documents",
      entityType: "profiles",
      entityId: data.userId,
      details: { message: data.message },
    });
    return { ok: true };
  });

// Admin approves the member's real account (after KYC). Clears any document request
// and starts the approval window if a deposit had not already done so.
export const approveMemberAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ member_status: "verified", documents_requested: null })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "approve_member_account",
      entityType: "profiles",
      entityId: data.userId,
    });
    return { ok: true };
  });
