import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet,
  TrendingUp,
  CalendarClock,
  Banknote,
  Download,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/format";
import { eligibleLoanAmount } from "@/lib/loan";
import { useLanguage } from "@/context/language";
import { ReferralWidget } from "@/components/dashboard/ReferralWidget";
import { ApprovalTimeline } from "@/components/dashboard/ApprovalTimeline";
import { MemberBadge } from "@/components/dashboard/MemberBadge";
import { BadgeHistory } from "@/components/dashboard/BadgeHistory";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Smart Loan" },
      { name: "description", content: "View your wallet balance, loan status, EMI progress and transactions." },
    ],
  }),
  component: Dashboard,
});

const balance = 50000;
const activeLoan = 300000;
const paidMonths = 8;
const totalMonths = 24;
const emi = 13568;

const transactions = [
  { type: "in", label: "Deposit · bKash", date: "12 Jun 2026", amount: 20000 },
  { type: "out", label: "EMI Payment #8", date: "01 Jun 2026", amount: 13568 },
  { type: "in", label: "Deposit · Nagad", date: "20 May 2026", amount: 15000 },
  { type: "out", label: "EMI Payment #7", date: "01 May 2026", amount: 13568 },
  { type: "in", label: "Loan Disbursement", date: "15 Oct 2025", amount: 300000 },
];

function Dashboard() {
  const { t } = useLanguage();
  const eligible = eligibleLoanAmount(balance);
  const usedPct = Math.round((activeLoan / eligible) * 100);
  const emiPct = Math.round((paidMonths / totalMonths) * 100);

  const kpis = [
    { label: t("dash_wallet"), value: formatBDT(balance), icon: Wallet, accent: true },
    { label: t("dash_limit"), value: formatBDT(eligible - activeLoan), icon: TrendingUp },
    { label: t("dash_active"), value: formatBDT(activeLoan), icon: Banknote },
    { label: t("dash_due"), value: formatBDT(emi), icon: CalendarClock },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("dash_welcome")},</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Rahim Uddin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-accent/15 text-accent hover:bg-accent/15">{t("status_verified")}</Badge>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Real-account approval timeline (72h) */}
      <ApprovalTimeline />

      {/* Due alert */}

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
        <div className="text-sm">
          <p className="font-semibold">{t("dash_due")}: {formatBDT(emi)} on 01 Jul 2026</p>
          <p className="text-muted-foreground">Pay before the due date to avoid a 1% late penalty.</p>
        </div>
        <Button variant="hero" size="sm" className="ml-auto" asChild>
          <Link to="/payments">{t("pay_emi")}</Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className={k.accent ? "gradient-primary text-primary-foreground shadow-elegant" : ""}>
            <CardContent className="p-5">
              <k.icon className="mb-3 h-5 w-5 opacity-80" />
              <div className="text-xs opacity-80">{k.label}</div>
              <div className="mt-1 text-xl font-bold sm:text-2xl">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{t("dash_eligibility")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold">{usedPct}%</span>
              </div>
              <Progress value={usedPct} />
              <p className="mt-2 text-xs text-muted-foreground">
                {formatBDT(activeLoan)} of {formatBDT(eligible)} limit used
              </p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">{t("dash_emi_progress")}</span>
                <span className="font-semibold">{paidMonths}/{totalMonths}</span>
              </div>
              <Progress value={emiPct} />
              <p className="mt-2 text-xs text-muted-foreground">{emiPct}% repaid</p>
            </div>
            <Button variant="accent" className="w-full" asChild>
              <Link to="/apply">{t("apply_now")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t("dash_transactions")}</CardTitle>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" /> {t("dash_download")}
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {transactions.map((tx, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      tx.type === "in" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {tx.type === "in" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tx.label}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === "in" ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {tx.type === "in" ? "+" : "−"}
                    {formatBDT(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MemberBadge />
        </div>
        <div className="lg:col-span-2">
          <ReferralWidget />
        </div>
      </div>
    </div>
  );
}
