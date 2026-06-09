import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2, Users, UserCheck, ShieldCheck, Banknote, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";
import { getMyReferralStats, type ReferralStats as ReferralStatsType } from "@/lib/referral.functions";

export function ReferralStats() {
  const { t } = useLanguage();
  const fetchStats = useServerFn(getMyReferralStats);
  const { data, isLoading } = useQuery({
    queryKey: ["my", "referral", "stats"],
    queryFn: () => fetchStats() as Promise<ReferralStatsType>,
  });

  const totals = data?.totals;
  const periods = data?.periods ?? [];

  const summary = [
    { icon: Users, label: t("refer_stats_referred"), value: String(totals?.referredUsers ?? 0) },
    { icon: UserCheck, label: t("refer_stats_signups"), value: String(totals?.signups ?? 0) },
    { icon: ShieldCheck, label: t("refer_stats_kyc"), value: String(totals?.kycVerified ?? 0) },
    { icon: Banknote, label: t("refer_stats_loans"), value: String(totals?.successfulLoans ?? 0) },
    { icon: Coins, label: t("refer_stats_rewards"), value: formatBDT(totals?.creditedRewards ?? 0) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" /> {t("refer_stats_title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t("refer_stats_subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {summary.map((s) => (
                <div key={s.label} className="rounded-xl bg-muted/50 p-3 text-center">
                  <s.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                  <div className="text-sm font-bold">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {periods.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("refer_stats_period")}</TableHead>
                      <TableHead className="text-right">{t("refer_stats_referred")}</TableHead>
                      <TableHead className="text-right">{t("refer_stats_signups")}</TableHead>
                      <TableHead className="text-right">{t("refer_stats_kyc")}</TableHead>
                      <TableHead className="text-right">{t("refer_stats_loans")}</TableHead>
                      <TableHead className="text-right">{t("refer_stats_rewards")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periods.map((p) => (
                      <TableRow key={p.period}>
                        <TableCell className="font-medium">{p.label}</TableCell>
                        <TableCell className="text-right">{p.referredUsers}</TableCell>
                        <TableCell className="text-right">{p.signups}</TableCell>
                        <TableCell className="text-right">{p.kycVerified}</TableCell>
                        <TableCell className="text-right">{p.successfulLoans}</TableCell>
                        <TableCell className="text-right font-semibold text-accent">
                          {formatBDT(p.creditedRewards)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">{t("refer_stats_none")}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
