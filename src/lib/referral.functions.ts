import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ReferralRow = {
  id: string;
  referred_id: string;
  reward_amount: number;
  status: string;
  created_at: string;
  referred_name: string | null;
};

export type MyReferral = {
  code: string;
  totalReferrals: number;
  creditedAmount: number;
  pendingAmount: number;
  rewardPerReferral: number;
  referrals: ReferralRow[];
};

// ---------- Member's own referral code + earnings ----------
export const getMyReferral = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyReferral> => {
    const uid = context.userId;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("referral_code")
      .eq("id", uid)
      .maybeSingle();

    const { data: rows } = await supabaseAdmin
      .from("referrals")
      .select("id, referred_id, reward_amount, status, created_at")
      .eq("referrer_id", uid)
      .order("created_at", { ascending: false });

    const list = rows ?? [];

    // Resolve referred member names
    const ids = list.map((r) => r.referred_id);
    const nameMap = new Map<string, string | null>();
    if (ids.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      (profs ?? []).forEach((p) => nameMap.set(p.id, p.full_name));
    }

    const creditedAmount = list
      .filter((r) => r.status === "credited")
      .reduce((s, r) => s + Number(r.reward_amount), 0);
    const pendingAmount = list
      .filter((r) => r.status !== "credited")
      .reduce((s, r) => s + Number(r.reward_amount), 0);

    return {
      code: profile?.referral_code ?? "",
      totalReferrals: list.length,
      creditedAmount,
      pendingAmount,
      rewardPerReferral: 500,
      referrals: list.map((r) => ({
        id: r.id,
        referred_id: r.referred_id,
        reward_amount: Number(r.reward_amount),
        status: r.status,
        created_at: r.created_at,
      referred_name: nameMap.get(r.referred_id) ?? null,
      })),
    };
  });

// ---------- Referral stats breakdown grouped by month ----------
export type ReferralPeriodStat = {
  /** YYYY-MM key */
  period: string;
  /** Human label e.g. "Jun 2026" */
  label: string;
  referredUsers: number;
  signups: number;
  kycVerified: number;
  kycPending: number;
  successfulLoans: number;
  creditedRewards: number;
};

export type ReferralStats = {
  totals: {
    referredUsers: number;
    signups: number;
    kycVerified: number;
    kycPending: number;
    successfulLoans: number;
    creditedRewards: number;
  };
  periods: ReferralPeriodStat[];
};

export const getMyReferralStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReferralStats> => {
    const uid = context.userId;

    const { data: rows } = await supabaseAdmin
      .from("referrals")
      .select("referred_id, status, reward_amount, created_at")
      .eq("referrer_id", uid)
      .order("created_at", { ascending: false });

    const list = rows ?? [];
    const ids = list.map((r) => r.referred_id);

    // Resolve signups (profiles exist), latest KYC status, and approved loans.
    const signupSet = new Set<string>();
    const kycByUser = new Map<string, string>();
    const approvedLoanSet = new Set<string>();

    if (ids.length) {
      const [profsR, kycR, loansR] = await Promise.all([
        supabaseAdmin.from("profiles").select("id").in("id", ids),
        supabaseAdmin
          .from("kyc_submissions")
          .select("user_id, status, created_at")
          .in("user_id", ids)
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("loan_applications")
          .select("user_id, status")
          .in("user_id", ids)
          .eq("status", "approved"),
      ]);

      (profsR.data ?? []).forEach((p) => signupSet.add(p.id));
      // First seen per user is the latest (ordered desc).
      (kycR.data ?? []).forEach((k) => {
        if (!kycByUser.has(k.user_id)) kycByUser.set(k.user_id, k.status);
      });
      (loansR.data ?? []).forEach((l) => approvedLoanSet.add(l.user_id));
    }

    const periodMap = new Map<string, ReferralPeriodStat>();
    const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

    const totals = {
      referredUsers: 0,
      signups: 0,
      kycVerified: 0,
      kycPending: 0,
      successfulLoans: 0,
      creditedRewards: 0,
    };

    for (const r of list) {
      const d = new Date(r.created_at);
      const period = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      let bucket = periodMap.get(period);
      if (!bucket) {
        bucket = {
          period,
          label: monthFmt.format(d),
          referredUsers: 0,
          signups: 0,
          kycVerified: 0,
          kycPending: 0,
          successfulLoans: 0,
          creditedRewards: 0,
        };
        periodMap.set(period, bucket);
      }

      const isSignup = signupSet.has(r.referred_id);
      const kyc = kycByUser.get(r.referred_id);
      const isVerified = kyc === "approved";
      const isPending = !!kyc && kyc !== "approved";
      const hasLoan = approvedLoanSet.has(r.referred_id);
      const credited = r.status === "credited" ? Number(r.reward_amount) : 0;

      bucket.referredUsers += 1;
      bucket.signups += isSignup ? 1 : 0;
      bucket.kycVerified += isVerified ? 1 : 0;
      bucket.kycPending += isPending ? 1 : 0;
      bucket.successfulLoans += hasLoan ? 1 : 0;
      bucket.creditedRewards += credited;

      totals.referredUsers += 1;
      totals.signups += isSignup ? 1 : 0;
      totals.kycVerified += isVerified ? 1 : 0;
      totals.kycPending += isPending ? 1 : 0;
      totals.successfulLoans += hasLoan ? 1 : 0;
      totals.creditedRewards += credited;
    }

    const periods = Array.from(periodMap.values()).sort((a, b) =>
      b.period.localeCompare(a.period),
    );

    return { totals, periods };
  });
