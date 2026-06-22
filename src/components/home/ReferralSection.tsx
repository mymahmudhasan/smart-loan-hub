import { Link } from "@tanstack/react-router";
import { Gift, Share2, UserCheck, Coins, ArrowRight, Users, TrendingUp, Wallet, Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/language";
import type { PublicReferralStats } from "@/lib/referral-stats.functions";

export function ReferralSection({ stats }: { stats?: PublicReferralStats }) {
  const { t } = useLanguage();

  const steps = [
    { icon: Share2, title: t("refer_s1_t"), desc: t("refer_s1_d") },
    { icon: UserCheck, title: t("refer_s2_t"), desc: t("refer_s2_d") },
    { icon: Wallet2, title: t("refer_s3_t"), desc: t("refer_s3_d") },
    { icon: Coins, title: t("refer_s4_t"), desc: t("refer_s4_d") },
  ];

  const formatBDT = (n: number) =>
    "৳" + n.toLocaleString("en-IN");

  const hasStats = stats && stats.totalReferrals > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-accent shadow-soft">
            <Gift className="h-3.5 w-3.5" /> {t("refer_badge")}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            {t("refer_title")}
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{t("refer_subtitle")}</p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl gradient-gold px-5 py-3 shadow-elegant">
            <Coins className="h-6 w-6 text-on-hero" />
            <span className="text-lg font-extrabold text-on-hero">{t("refer_reward")}</span>
          </div>

          {/* Live stats */}
          {hasStats && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <Users className="h-5 w-5 text-primary" />
                <div className="mt-1 text-xl font-extrabold">{stats.totalReferrals.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t("refer_stat_referrals")}</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div className="mt-1 text-xl font-extrabold">{stats.totalReferrers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t("refer_stat_referrers")}</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <Wallet className="h-5 w-5 text-success" />
                <div className="mt-1 text-xl font-extrabold">{formatBDT(stats.totalRewardsCredited)}</div>
                <div className="text-xs text-muted-foreground">{t("refer_stat_credited")}</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 text-center">
                <Coins className="h-5 w-5 text-warning" />
                <div className="mt-1 text-xl font-extrabold">{formatBDT(stats.totalRewardsPending)}</div>
                <div className="text-xs text-muted-foreground">{t("refer_stat_pending")}</div>
              </Card>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                {t("refer_cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/dashboard">{t("nav_dashboard")}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-soft"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}

          {/* Live deposits feed */}
          <LiveDeposits />
        </div>

      </div>
    </section>
  );
}
