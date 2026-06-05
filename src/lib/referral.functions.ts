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
