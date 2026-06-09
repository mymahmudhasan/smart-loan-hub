import { ShieldCheck, Lock, Landmark, Headphones, BadgeCheck, Clock, FileCheck } from "lucide-react";
import { useLanguage } from "@/context/language";

export function TrustBadges() {
  const { t } = useLanguage();

  const badges = [
    { icon: ShieldCheck, t: "trust_b1_t" as const, d: "trust_b1_d" as const },
    { icon: Lock, t: "trust_b2_t" as const, d: "trust_b2_d" as const },
    { icon: Landmark, t: "trust_b3_t" as const, d: "trust_b3_d" as const },
    { icon: BadgeCheck, t: "trust_b4_t" as const, d: "trust_b4_d" as const },
    { icon: Clock, t: "trust_b5_t" as const, d: "trust_b5_d" as const },
    { icon: Headphones, t: "trust_b6_t" as const, d: "trust_b6_d" as const },
  ];

  const credentials = [
    { label: "reg_company" as const, value: "reg_company_val" as const },
    { label: "reg_license" as const, value: "reg_license_val" as const },
    { label: "reg_tin" as const, value: "reg_tin_val" as const },
  ];


  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            {t("trust_eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("trust_title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("trust_subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.t}
              className="flex items-start gap-4 rounded-2xl border bg-background p-5 transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <b.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{t(b.t)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(b.d)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
