import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/language";
import { bankLogos } from "./BankLogos";

const partners = ["BKASH", "NAGAD", "ROCKET", "UPAY", "BRAC"] as const;

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

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {partners.map((key) => {
            const logo = bankLogos[key];
            const needsWhiteBg = key === "BKASH" || key === "NAGAD" || key === "BRAC";
            return (
              <div
                key={key}
                className={`group flex items-center justify-center overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-elegant ${
                  needsWhiteBg ? "bg-white p-3" : "bg-background p-3"
                }`}
              >
                <div className="h-16 w-full max-w-[180px] transition-transform group-hover:scale-105">
                  <img
                    src={logo.url}
                    alt={logo.alt}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
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
