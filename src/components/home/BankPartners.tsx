import { Landmark, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/language";

const partners = [
  { name: "BRAC Bank", abbr: "BRAC" },
  { name: "Dutch-Bangla Bank", abbr: "DBBL" },
  { name: "Islami Bank Bangladesh", abbr: "IBBL" },
  { name: "Sonali Bank", abbr: "SONALI" },
  { name: "Janata Bank", abbr: "JANATA" },
  { name: "Agrani Bank", abbr: "AGRANI" },
  { name: "Rupali Bank", abbr: "RUPALI" },
  { name: "City Bank", abbr: "CITY" },
  { name: "Eastern Bank", abbr: "EBL" },
  { name: "Prime Bank", abbr: "PRIME" },
  { name: "One Bank", abbr: "ONE" },
  { name: "Bank Asia", abbr: "ASIA" },
];

export function BankPartners() {
  const { t } = useLanguage();

  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:py-18">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <Landmark className="h-3.5 w-3.5 text-accent" />
            {t("bank_eyebrow")}
          </span>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{t("bank_title")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("bank_subtitle")}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((p) => (
            <div
              key={p.abbr}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-background p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Landmark className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold leading-tight">{p.name}</span>
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
