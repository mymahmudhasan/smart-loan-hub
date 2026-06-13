import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/language";

const partners = [
  { name: "BRAC Bank", abbr: "BRAC", colors: "from-[#00A651] to-[#007A3D]" },
  { name: "Dutch-Bangla Bank", abbr: "DBBL", colors: "from-[#ED1C24] to-[#B30000]" },
  { name: "Islami Bank Bangladesh", abbr: "IBBL", colors: "from-[#1B4D3E] to-[#0F2E24]" },
  { name: "Sonali Bank", abbr: "SONALI", colors: "from-[#0055A5] to-[#003D75]" },
  { name: "City Bank", abbr: "CITY", colors: "from-[#F57C00] to-[#E65100]" },
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

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((p) => (
            <div
              key={p.abbr}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border bg-background p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.colors} text-sm font-extrabold text-white shadow-soft transition-transform group-hover:scale-105`}
              >
                {p.abbr.slice(0, 2)}
              </span>
              <span className="text-xs font-semibold leading-tight text-foreground">{p.name}</span>
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
