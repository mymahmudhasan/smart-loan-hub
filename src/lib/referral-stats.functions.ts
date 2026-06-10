import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PublicReferralStats = {
  totalReferrals: number;
  totalReferrers: number;
  totalRewardsCredited: number;
  totalRewardsPending: number;
  topReferrers: { name: string | null; referrals: number }[];
};

export const getPublicReferralStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicReferralStats> => {
    const { data: agg } = await supabaseAdmin
      .from("referrals")
      .select("referrer_id, reward_amount, status");

    const rows = agg ?? [];
    const totalReferrals = rows.length;
    const totalReferrers = new Set(rows.map((r) => r.referrer_id)).size;
    const totalRewardsCredited = rows
      .filter((r) => r.status === "credited")
      .reduce((s, r) => s + Number(r.reward_amount), 0);
    const totalRewardsPending = rows
      .filter((r) => r.status !== "credited")
      .reduce((s, r) => s + Number(r.reward_amount), 0);

    // Top 5 referrers by count
    const countByReferrer = new Map<string, number>();
    for (const r of rows) {
      countByReferrer.set(r.referrer_id, (countByReferrer.get(r.referrer_id) || 0) + 1);
    }
    const topIds = Array.from(countByReferrer.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    let topReferrers: { name: string | null; referrals: number }[] = [];
    if (topIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name")
        .in("id", topIds);
      const nameMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      topReferrers = topIds.map((id) => ({
        name: nameMap.get(id) ?? null,
        referrals: countByReferrer.get(id) ?? 0,
      }));
    }

    return {
      totalReferrals,
      totalReferrers,
      totalRewardsCredited,
      totalRewardsPending,
      topReferrers,
    };
  },
);
