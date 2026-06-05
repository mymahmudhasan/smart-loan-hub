import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  TrendingUp,
  Wallet,
  Zap,
  UserCheck,
  PiggyBank,
  HandCoins,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/language";
import { listActiveBanners } from "@/lib/banner.functions";
import { OffersBanner } from "@/components/home/OffersBanner";
import { ReferralSection } from "@/components/home/ReferralSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Loan Membership Platform | Secure Loans in Bangladesh" },
      {
        name: "description",
        content:
          "Become a verified member and unlock loans up to 10× your balance at 8% annual interest. Mobile-first, secure lending for Bangladesh.",
      },
    ],
  }),
  loader: () => listActiveBanners(),
  errorComponent: () => <Home />,
  component: Home,
});

function Home() {
  const { t } = useLanguage();
  let offers: Awaited<ReturnType<typeof listActiveBanners>> = [];
  try {
    offers = Route.useLoaderData() ?? [];
  } catch {
    offers = [];
  }

  const stats = [
    { value: "25,000+", key: "stat_members" as const, icon: UserCheck },
    { value: "৳1.2B+", key: "stat_disbursed" as const, icon: HandCoins },
    { value: "8%", key: "stat_rate" as const, icon: TrendingUp },
    { value: "24h", key: "stat_approval" as const, icon: Zap },
  ];

  const steps = [
    { icon: UserCheck, t: "step1_t" as const, d: "step1_d" as const },
    { icon: PiggyBank, t: "step2_t" as const, d: "step2_d" as const },
    { icon: HandCoins, t: "step3_t" as const, d: "step3_d" as const },
    { icon: CalendarCheck, t: "step4_t" as const, d: "step4_d" as const },
  ];

  const features = [
    { icon: ShieldCheck, t: "f1_t" as const, d: "f1_d" as const },
    { icon: TrendingUp, t: "f2_t" as const, d: "f2_d" as const },
    { icon: Wallet, t: "f3_t" as const, d: "f3_d" as const },
    { icon: Zap, t: "f4_t" as const, d: "f4_d" as const },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-hero opacity-[0.06] dark:opacity-100" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              {t("hero_badge")}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero_title")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              {t("hero_subtitle")}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  {t("hero_cta_primary")} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/calculator">{t("hero_cta_secondary")}</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] gradient-primary opacity-20 blur-3xl" />
            <img
              src={heroImg}
              alt="Smart Loan mobile dashboard with secure financial charts"
              width={1280}
              height={960}
              className="animate-float w-full rounded-3xl shadow-elegant"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.key} className="text-center">
              <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-2xl font-extrabold sm:text-3xl">{s.value}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{t(s.key)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("how_title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("how_subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.t} className="relative p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <span className="absolute right-4 top-4 text-5xl font-extrabold text-primary/10">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold">{t(s.t)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(s.d)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t("features_title")}</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.t} className="p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{t(f.t)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(f.d)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl gradient-hero px-6 py-14 text-center shadow-elegant">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">{t("cta_title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">{t("cta_subtitle")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="glass" size="xl" asChild>
              <Link to="/signup">{t("hero_cta_primary")}</Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/membership">{t("learn_more")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
