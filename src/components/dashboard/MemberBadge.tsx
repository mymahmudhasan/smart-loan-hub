import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Award, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/lib/format";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { getMyBadge } from "@/lib/member.functions";
import { BADGE_TIERS, getBadgeTier, getNextTier } from "@/lib/badges";

export function MemberBadge() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const fetchBadge = useServerFn(getMyBadge);

  const { data, isLoading } = useQuery({
    queryKey: ["my-badge", user?.id],
    queryFn: () => fetchBadge(),
    enabled: !!user && !loading,
    refetchInterval: 60_000,
  });

  const total = data?.totalDeposits ?? 0;
  const current = getBadgeTier(total);
  const next = getNextTier(total);

  const remaining = next ? Math.max(0, next.threshold - total) : 0;
  const progressPct = next
    ? Math.round((total / next.threshold) * 100)
    : 100;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("tier_heading")}</CardTitle>
        <Award className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold shadow-soft",
              current.className,
            )}
          >
            <Award className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold">{t(current.labelKey)}</p>
            <p className="truncate text-xs text-muted-foreground">{t(current.descKey)}</p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("tier_deposited")}</span>
            <span className="font-semibold">{isLoading ? "…" : formatBDT(total)}</span>
          </div>
        </div>

        {next ? (
          <div className="space-y-2">
            <Progress value={progressPct} />
            <p className="text-xs text-muted-foreground">
              {t("tier_next")
                .replace("{amount}", formatBDT(remaining))
                .replace("{tier}", t(next.labelKey))}
            </p>
          </div>
        ) : (
          <p className="text-xs font-medium text-accent">{t("tier_max")}</p>
        )}

        {/* All tiers overview */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {BADGE_TIERS.map((tier) => {
            const unlocked = total >= tier.threshold;
            return (
              <div
                key={tier.key}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-2 text-center",
                  unlocked ? tier.className : "border-border bg-muted/30 text-muted-foreground opacity-60",
                )}
              >
                {unlocked ? <Award className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span className="text-[10px] font-semibold leading-tight">{t(tier.labelKey)}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
