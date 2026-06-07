// Membership tier badges, derived from a member's total completed deposits (BDT).
// Client-safe pure module (no server imports).

export type BadgeTierKey = "free" | "bronze" | "silver" | "gold";

export interface BadgeTier {
  key: BadgeTierKey;
  /** Minimum total completed deposits (BDT) required for this tier. */
  threshold: number;
  /** Translation keys (see src/context/language.tsx). */
  labelKey: string;
  descKey: string;
  /** CSS utility class defined in src/styles.css. */
  className: string;
}

// Ordered ascending by threshold.
export const BADGE_TIERS: BadgeTier[] = [
  { key: "free", threshold: 0, labelKey: "tier_free", descKey: "tier_free_desc", className: "tier-free" },
  { key: "bronze", threshold: 5000, labelKey: "tier_bronze", descKey: "tier_bronze_desc", className: "tier-bronze" },
  { key: "silver", threshold: 10000, labelKey: "tier_silver", descKey: "tier_silver_desc", className: "tier-silver" },
  { key: "gold", threshold: 30000, labelKey: "tier_gold", descKey: "tier_gold_desc", className: "tier-gold" },
];

/** Resolve the current tier for a given total deposit amount. */
export function getBadgeTier(totalDeposits: number): BadgeTier {
  const amount = Number.isFinite(totalDeposits) ? totalDeposits : 0;
  let current = BADGE_TIERS[0];
  for (const tier of BADGE_TIERS) {
    if (amount >= tier.threshold) current = tier;
  }
  return current;
}

/** The next tier above the current one, or null if already at the top. */
export function getNextTier(totalDeposits: number): BadgeTier | null {
  const amount = Number.isFinite(totalDeposits) ? totalDeposits : 0;
  return BADGE_TIERS.find((t) => t.threshold > amount) ?? null;
}
