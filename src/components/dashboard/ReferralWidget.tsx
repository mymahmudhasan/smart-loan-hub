import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gift, Copy, Users, Coins, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";
import { getMyReferral, type MyReferral } from "@/lib/referral.functions";

export function ReferralWidget() {
  const { t } = useLanguage();
  const fetchReferral = useServerFn(getMyReferral);
  const { data, isLoading } = useQuery({
    queryKey: ["my", "referral"],
    queryFn: () => fetchReferral() as Promise<MyReferral>,
  });

  const link =
    data?.code && typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${data.code}`
      : "";

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success(t("refer_copied"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="h-4 w-4 text-accent" /> {t("refer_widget_title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="rounded-xl gradient-gold p-4 text-on-hero shadow-soft">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Coins className="h-4 w-4" /> {t("refer_reward")}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("refer_code_label")}</p>
              <div className="flex gap-2">
                <Input readOnly value={data?.code ?? ""} className="font-mono font-semibold" />
                <Button variant="outline" onClick={copy} disabled={!link}>
                  <Copy className="h-4 w-4" /> {t("refer_copy")}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat icon={Users} label={t("refer_total")} value={String(data?.totalReferrals ?? 0)} />
              <Stat icon={Coins} label={t("refer_earned")} value={formatBDT(data?.creditedAmount ?? 0)} />
              <Stat icon={Clock} label={t("refer_pending")} value={formatBDT(data?.pendingAmount ?? 0)} />
            </div>

            {data?.referrals.length ? (
              <ul className="divide-y">
                {data.referrals.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.referred_name ?? "New member"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-accent">
                        +{formatBDT(r.reward_amount)}
                      </span>
                      <Badge variant={r.status === "credited" ? "default" : "outline"}>
                        {r.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-muted-foreground">{t("refer_none")}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
