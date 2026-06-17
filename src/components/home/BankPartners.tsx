import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/language";
import { BkashLogo, NagadLogo, RocketLogo, UpayLogo } from "./BankLogos";

const partners = [
  { abbr: "BKASH", Logo: BkashLogo },
  { abbr: "NAGAD", Logo: NagadLogo },
  { abbr: "ROCKET", Logo: RocketLogo },
  { abbr: "UPAY", Logo: UpayLogo },
];

export function BankPartners() {
  const { t } = useLanguage();

  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:py-18">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[8px] font-bold text-primary-foreground">
              B
            </span>
            {t("bank_eyebrow")}
          </span>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{t("bank_title")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("bank_subtitle")}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {partners.map((p) => (
            <div
              key={p.abbr}
              className="group flex items-center justify-center rounded-2xl border bg-background p-6 transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="h-12 w-full max-w-[150px] transition-transform group-hover:scale-105">
                <p.Logo className="h-full w-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
          {(["bank_badge_1", "bank_badge_2", "bank_badge_3", "bank_badge_4"] as const).map(
            (key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft"
              >
                <CheckCircle className="h-3.5 w-3.5 text-accent" />
                {t(key)}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
