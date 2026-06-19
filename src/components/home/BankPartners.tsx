import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/language";
import { bankLogos } from "./BankLogos";

const partners = ["BKASH", "UPAY", "BRAC", "CITY", "DBBL"] as const;

export function BankPartners() {
  const { t } = useLanguage();

  return (
    <section className="border-y bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
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

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10">
          {partners.map((key) => {
            const logo = bankLogos[key];
            return (
              <div
                key={key}
                className="group flex items-center justify-center rounded-xl bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
              >
                <div className="h-16 w-full max-w-[180px] transition-transform group-hover:scale-105 sm:h-20 sm:max-w-[200px]">
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
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1.5 text-xs font-medium text-foreground shadow-soft"
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
