import {
  Landmark,
  FileX2,
  ShieldOff,
  Zap,
  CalendarClock,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/context/language";

type Benefit = {
  icon: typeof Landmark;
  title: { en: string; bn: string };
};

const benefits: Benefit[] = [
  {
    icon: Landmark,
    title: { en: "No bank account needed", bn: "ব্যাংক অ্যাকাউন্ট লাগবে না" },
  },
  {
    icon: FileX2,
    title: { en: "No paperwork needed", bn: "কোনো কাগজপত্র লাগবে না" },
  },
  {
    icon: ShieldOff,
    title: { en: "No collateral needed", bn: "কোনো জামানত লাগবে না" },
  },
  {
    icon: Zap,
    title: { en: "Instant disbursement to your account", bn: "তাৎক্ষণিক অ্যাকাউন্টে বিতরণ" },
  },
  {
    icon: CalendarClock,
    title: { en: "Repay in easy monthly installments", bn: "সহজ মাসিক কিস্তিতে পরিশোধ" },
  },
  {
    icon: RefreshCw,
    title: { en: "Installments will be auto-deducted", bn: "কিস্তি স্বয়ংক্রিয়ভাবে কেটে নেওয়া হবে" },
  },
];

export function WhyEasy() {
  const { lang, t } = useLanguage();

  return (
    <section className="relative overflow-hidden gradient-hero py-16 lg:py-24">
      {/* subtle radial texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0, transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-on-hero sm:text-4xl">
            {t("why_easy_title")}
          </h2>
          <p className="mt-3 text-on-hero/80">{t("why_easy_subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group relative rounded-3xl bg-card pb-7 pt-12 text-center shadow-elegant transition-transform hover:-translate-y-1"
            >
              {/* floating icon circle */}
              <span className="absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-soft ring-4 ring-card transition-transform group-hover:scale-105">
                <b.icon className="h-7 w-7" />
              </span>
              <p className="mx-auto max-w-[15rem] px-4 text-lg font-semibold text-card-foreground">
                {b.title[lang]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
