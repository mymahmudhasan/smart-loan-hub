import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAudit } from "./admin.server";
import { computeBadgeHistory } from "./badges";

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
        method: z.enum(["bkash"]),
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

    // A deposit starts the 72-hour real-account approval window (once).
    if (data.type === "deposit") {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("approval_started_at, member_status")
        .eq("id", context.userId)
        .maybeSingle();
      if (prof && !prof.approval_started_at && prof.member_status !== "verified") {
        await supabaseAdmin
          .from("profiles")
          .update({ approval_started_at: new Date().toISOString() })
          .eq("id", context.userId);
      }
    }

    await logAudit({
      actorId: context.userId,
      action: `member_${data.type}_request`,
      entityType: "transactions",
      entityId: row?.id,
      details: { amount: data.amount, method: data.method },
    });
    return { ok: true };
  });

// ---------- Member's real-account approval status (72h timeline) ----------
export const APPROVAL_WINDOW_HOURS = 72;

export const getMyApprovalStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const [profileR, kycR, depositR] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("member_status, approval_started_at, documents_requested, full_name")
        .eq("id", uid)
        .maybeSingle(),
      supabaseAdmin
        .from("kyc_submissions")
        .select("status, reviewer_notes, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("transactions")
        .select("id, amount, status, created_at")
        .eq("user_id", uid)
        .eq("type", "deposit")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (profileR.error) throw new Error(profileR.error.message);

    const startedAt = profileR.data?.approval_started_at ?? null;
    const deadline = startedAt
      ? new Date(new Date(startedAt).getTime() + APPROVAL_WINDOW_HOURS * 3600_000).toISOString()
      : null;

    return {
      memberStatus: profileR.data?.member_status ?? "pending",
      fullName: profileR.data?.full_name ?? null,
      documentsRequested: profileR.data?.documents_requested ?? null,
      approvalStartedAt: startedAt,
      approvalDeadline: deadline,
      windowHours: APPROVAL_WINDOW_HOURS,
      kycStatus: kycR.data?.status ?? null,
      kycNotes: kycR.data?.reviewer_notes ?? null,
      latestDeposit: depositR.data ?? null,
    };
  });



// ---------- Member's membership tier (badge) from total deposits ----------
export const getMyBadge = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("amount")
      .eq("user_id", context.userId)
      .eq("type", "deposit")
      .eq("status", "completed");
    if (error) throw new Error(error.message);
    const totalDeposits = (data ?? []).reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
    return { totalDeposits };
  });

// ---------- Member's badge history (when each tier was reached) ----------
export const getMyBadgeHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const [txR, profR] = await Promise.all([
      supabaseAdmin
        .from("transactions")
        .select("amount, created_at")
        .eq("user_id", uid)
        .eq("type", "deposit")
        .eq("status", "completed")
        .order("created_at", { ascending: true }),
      supabaseAdmin.from("profiles").select("created_at").eq("id", uid).maybeSingle(),
    ]);
    if (txR.error) throw new Error(txR.error.message);

    const deposits = txR.data ?? [];
    const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
    const history = computeBadgeHistory(deposits, profR.data?.created_at ?? null);
    return { totalDeposits, history };
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

// ---------- Member self signup (bypasses rate limits and email confirmation) ----------
export const signUpMember = createServerFn({ method: "POST" })
  .inputValidator((d: { fullName: string; phone: string; profession: string; password: string }) =>
    z
      .object({
        fullName: z.string().min(1).max(100),
        phone: z.string().min(11).max(20),
        profession: z.string().min(1),
        password: z.string().min(6),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const email = `${data.phone.replace(/\D/g, "")}@smartloan.local`;
    
    const { data: userRow, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        phone: data.phone,
        occupation: data.profession,
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    return { ok: true, userId: userRow.user.id };
  });




