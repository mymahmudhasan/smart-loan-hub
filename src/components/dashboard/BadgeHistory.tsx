import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Award, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/lib/format";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { getMyBadgeHistory } from "@/lib/member.functions";
import { BADGE_TIERS } from "@/lib/badges";

function tierMeta(key: string) {
  return BADGE_TIERS.find((t) => t.key === key) ?? BADGE_TIERS[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function BadgeHistory() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const fetchHistory = useServerFn(getMyBadgeHistory);

  const { data, isLoading } = useQuery({
    queryKey: ["my-badge-history", user?.id],
    queryFn: () => fetchHistory(),
    enabled: !!user && !loading,
    refetchInterval: 60_000,
  });

  const history = data?.history ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("tier_history_heading")}</CardTitle>
        <History className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("tier_history_empty")}</p>
        ) : (
          <ol className="relative space-y-6 pl-2">
            {history.map((award, i) => {
              const meta = tierMeta(award.key);
              const isFree = award.key === "free";
              return (
                <li key={`${award.key}-${i}`} className="relative flex gap-4">
                  {/* connector line */}
                  {i < history.length - 1 && (
                    <span className="absolute left-[18px] top-10 h-[calc(100%-8px)] w-px bg-border" />
                  )}
                  <span
                    className={cn(
                      "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-soft",
                      meta.className,
                    )}
                  >
                    <Award className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {isFree
                        ? t("tier_free")
                        : t("tier_reached").replace("{tier}", t(meta.labelKey))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("tier_earned_on")} {formatDate(award.awardedAt)}
                    </p>
                    {!isFree && (
                      <p className="text-xs text-muted-foreground">
                        {t("tier_at_total").replace("{amount}", formatBDT(award.totalAt))}
                      </p>
                    )}
                    {isFree && (
                      <p className="text-xs text-muted-foreground">{t("tier_account_created")}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
