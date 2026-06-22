import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/language";
import { cn } from "@/lib/utils";

type BadgeKey = "live_badge_membership" | "live_badge_emi" | "live_badge_savings";

type Deposit = {
  district: string;
  name: string;
  badge: BadgeKey;
  amount: number;
};

// 20 demo deposits — gives the feed a lively, "people are active" feel.
const POOL: Deposit[] = [
  { district: "ঢা", name: "তানিয়া ***", badge: "live_badge_membership", amount: 1180 },
  { district: "চ", name: "রাকিব ***", badge: "live_badge_emi", amount: 1240 },
  { district: "সি", name: "আমিনা ***", badge: "live_badge_savings", amount: 540 },
  { district: "রা", name: "সামির ***", badge: "live_badge_membership", amount: 320 },
  { district: "খু", name: "আলী ***৮২", badge: "live_badge_emi", amount: 4820 },
  { district: "ব", name: "মারিয়া ***", badge: "live_badge_savings", amount: 980 },
  { district: "রং", name: "সোহেল ***", badge: "live_badge_membership", amount: 2150 },
  { district: "ম", name: "নুসরাত ***", badge: "live_badge_emi", amount: 760 },
  { district: "কু", name: "ইমরান ***", badge: "live_badge_savings", amount: 3300 },
  { district: "গা", name: "ফারিয়া ***", badge: "live_badge_membership", amount: 1500 },
  { district: "না", name: "জাহিদ ***", badge: "live_badge_emi", amount: 640 },
  { district: "বগ", name: "রিয়া ***", badge: "live_badge_savings", amount: 5200 },
  { district: "যশ", name: "কামাল ***", badge: "live_badge_membership", amount: 1100 },
  { district: "দি", name: "সাদিয়া ***", badge: "live_badge_emi", amount: 870 },
  { district: "ফ", name: "হাসান ***", badge: "live_badge_savings", amount: 2600 },
  { district: "ঢা", name: "মিতু ***", badge: "live_badge_membership", amount: 430 },
  { district: "চ", name: "রনি ***", badge: "live_badge_emi", amount: 1950 },
  { district: "সি", name: "পপি ***", badge: "live_badge_savings", amount: 720 },
  { district: "খু", name: "শাকিল ***", badge: "live_badge_membership", amount: 3850 },
  { district: "রা", name: "লামিয়া ***", badge: "live_badge_emi", amount: 1280 },
];

const VISIBLE = 6;

type FeedRow = { uid: number; deposit: Deposit; age: number };

const toBnDigits = (s: string) =>
  s.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

export function LiveDeposits() {
  const { t, lang } = useLanguage();
  const poolIdx = useRef(0);
  const uidRef = useRef(0);

  const makeRow = (age: number): FeedRow => {
    const deposit = POOL[poolIdx.current % POOL.length];
    poolIdx.current += 1;
    return { uid: uidRef.current++, deposit, age };
  };

  const [rows, setRows] = useState<FeedRow[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => makeRow(i * 7)),
  );

  useEffect(() => {
    // Tick the relative timers every second.
    const tick = setInterval(() => {
      setRows((prev) => prev.map((r) => ({ ...r, age: r.age + 1 })));
    }, 1000);
    // Stream a new deposit in every few seconds.
    const stream = setInterval(() => {
      setRows((prev) => [makeRow(0), ...prev].slice(0, VISIBLE));
    }, 3500);
    return () => {
      clearInterval(tick);
      clearInterval(stream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtAmount = (n: number) => {
    const s = "৳" + n.toLocaleString("en-IN");
    return lang === "bn" ? toBnDigits(s) : s;
  };

  const fmtAge = (age: number) => {
    if (age < 5) return t("live_now");
    if (age < 60) {
      const v = String(age);
      return (lang === "bn" ? toBnDigits(v) : v) + t("live_sec_ago");
    }
    const m = Math.floor(age / 60);
    const v = String(m);
    return (lang === "bn" ? toBnDigits(v) : v) + t("live_min_ago");
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {t("live_title")}
        </h4>
        <span className="flex items-center gap-1.5 text-xs font-medium text-success">
          <span className="h-2 w-2 rounded-full bg-success animate-live-pulse" />
          {t("live_streaming")}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("live_subtitle")}</p>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div
            key={r.uid}
            className={cn(
              "flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5",
              r.age < 2 && "animate-deposit-in",
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {r.deposit.district}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{r.deposit.name}</span>
                <span className="shrink-0 rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                  {t(r.deposit.badge)}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-extrabold text-success">+{fmtAmount(r.deposit.amount)}</div>
              <div className="text-[10px] text-muted-foreground">{fmtAge(r.age)}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
