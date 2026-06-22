import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PiggyBank, ShieldCheck, CheckCircle2, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eligibleLoanAmount, ELIGIBILITY_MULTIPLIER } from "@/lib/loan";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { getMyProfile } from "@/lib/profile.functions";
import { MemberBadge } from "@/components/dashboard/MemberBadge";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership | Smart Loan" },
      {
        name: "description",
        content:
          "Membership unlocks loans up to 10× your deposited balance. Become a verified member or upgrade your existing membership to access secure lending in Bangladesh.",
      },
    ],
  }),
  component: Membership,
});

const examples = [10000, 20000, 50000];

function Membership() {
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const { user, loading: authLoading } = useAuth();
  const fetchProfile = useServerFn(getMyProfile);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile-membership", user?.id],
    queryFn: () => fetchProfile(),
    enabled: !!user && !authLoading,
  });

  const profile = profileData?.profile;
  const actualBalance = Number(profile?.member_balance ?? 0);
  const isMember = profile?.member_status === "verified";

  const [balance, setBalance] = useState(20000);

  useEffect(() => {
    if (user && !profileLoading) {
      setBalance(actualBalance || 20000);
    }
  }, [user, actualBalance, profileLoading]);

  const benefits = [
    "Loans up to 10× your member balance",
    "Fixed 8% annual interest, reducing balance",
    "Flexible terms up to 36 months",
    "bKash, Nagad & bank transfer support",
    "Priority approval for verified members",
    "Full transaction history & statements",
  ];

  const cta = !user
    ? { to: "/signup", label: t("hero_cta_primary"), icon: ArrowRight }
    : isMember
      ? { to: "/payments", label: t("mem_upgrade"), icon: TrendingUp }
      : { to: "/profile", label: t("mem_complete_verification"), icon: Sparkles };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
      <div className="mb-10 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <PiggyBank className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("mem_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("mem_subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t("mem_eligible")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl gradient-hero p-6 text-on-hero shadow-soft">
              <div className="text-sm opacity-80">{t("mem_balance")}</div>
              <div className="text-3xl font-extrabold">
                {profileLoading ? "…" : formatBDT(balance)}
              </div>
              <div className="mt-4 border-t border-white/20 pt-4">
                <div className="text-sm opacity-80">
                  {t("mem_eligible")} ({ELIGIBILITY_MULTIPLIER}×)
                </div>
                <div className="text-4xl font-extrabold">{formatBDT(eligibleLoanAmount(balance))}</div>
              </div>
            </div>
            <Slider
              value={[balance]}
              min={5000}
              max={500000}
              step={5000}
              onValueChange={(v) => setBalance(v[0])}
              disabled={profileLoading}
            />
            <div className="grid grid-cols-3 gap-2">
              {examples.map((e) => (
                <button
                  key={e}
                  onClick={() => setBalance(e)}
                  disabled={profileLoading}
                  className="rounded-lg border bg-card px-2 py-3 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  <div className="text-xs text-muted-foreground">{formatBDT(e)}</div>
                  <div className="text-sm font-semibold text-primary">
                    {formatBDT(eligibleLoanAmount(e))}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" className="w-full" asChild>
                <Link to={cta.to}>
                  {cta.label} <cta.icon className="h-4 w-4" />
                </Link>
              </Button>
              {user && isMember && (
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/apply">
                    {t("mem_apply_loan")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {user && <MemberBadge />}

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{t("mem_status")}</CardTitle>
              <Badge className="bg-accent/15 text-accent hover:bg-accent/15">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Secure
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardContent className="p-6">
              <h3 className="font-semibold">{t("mem_balance")} × {ELIGIBILITY_MULTIPLIER} = {t("mem_eligible")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your borrowing power scales directly with your deposited balance. Top up anytime to
                instantly increase your available loan limit.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
