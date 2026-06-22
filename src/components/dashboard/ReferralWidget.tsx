import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gift, Copy, Users, Coins, Clock, Loader2, MessageCircle, Facebook, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";
import { getMyReferral, type MyReferral } from "@/lib/referral.functions";

export function ReferralWidget() {
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const fetchReferral = useServerFn(getMyReferral);
  const { data, isLoading } = useQuery({
    queryKey: ["my", "referral"],
    queryFn: () => fetchReferral() as Promise<MyReferral>,
  });

  const link =
    data?.code && typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${data.code}`
      : "";

  const inviteMessage = link ? `${t("refer_invite_message")}${link}` : "";

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success(t("refer_copied"));
  };

  const copyMessage = async () => {
    if (!inviteMessage) return;
    await navigator.clipboard.writeText(inviteMessage);
    toast.success(t("refer_msg_copied"));
  };

  const openShare = (url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareTargets = [
    {
      label: t("refer_share_whatsapp"),
      icon: MessageCircle,
      onClick: () => openShare(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`),
    },
    {
      label: t("refer_share_telegram"),
      icon: Send,
      onClick: () =>
        openShare(
          `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(t("refer_invite_message"))}`,
        ),
    },
    {
      label: t("refer_share_facebook"),
      icon: Facebook,
      onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`),
    },
  ];

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

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("refer_share_label")}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {shareTargets.map((s) => (
                  <Button
                    key={s.label}
                    variant="outline"
                    size="sm"
                    onClick={s.onClick}
                    disabled={!link}
                    className="justify-center"
                  >
                    <s.icon className="h-4 w-4" /> {s.label}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyMessage}
                  disabled={!inviteMessage}
                  className="justify-center"
                >
                  <Copy className="h-4 w-4" /> {t("refer_share_copy_msg")}
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
