import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, TrendingUp, Wallet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateLoan, ANNUAL_RATE, MAX_MONTHS } from "@/lib/loan";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";


export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Loan EMI Calculator | Smart Loan" },
      {
        name: "description",
        content:
          "Calculate your monthly EMI, total interest and repayment schedule at 8% annual interest using the reducing-balance method.",
      },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(24);

  const result = useMemo(() => calculateLoan(amount, months), [amount, months]);

  const summary = [
    { label: t("calc_emi"), value: formatBDT(result.emi, true), icon: Wallet, accent: true },
    { label: t("calc_interest"), value: formatBDT(result.totalInterest, true), icon: TrendingUp },
    { label: t("calc_total"), value: formatBDT(result.totalPayable, true), icon: Receipt },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <Calculator className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("calc_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("calc_subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("calc_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("calc_amount")}</Label>
                <Input
                  type="number"
                  value={amount}
                  min={10000}
                  max={5000000}
                  step={5000}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="h-9 w-36 text-right font-semibold"
                />
              </div>
              <Slider
                value={[amount]}
                min={10000}
                max={5000000}
                step={5000}
                onValueChange={(v) => setAmount(v[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>৳10K</span>
                <span>৳50L</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("calc_duration")}</Label>
                <span className="font-semibold">{months} {L("mo", "মাস")}</span>
              </div>
              <Slider
                value={[months]}
                min={3}
                max={MAX_MONTHS}
                step={1}
                onValueChange={(v) => setMonths(v[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span>
                <span>{MAX_MONTHS} {L("months", "মাস")}</span>
              </div>
            </div>

            <div className="rounded-xl bg-muted/60 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("stat_rate")}</span>
                <span className="font-semibold">{(ANNUAL_RATE * 100).toFixed(0)}% / yr</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-semibold">Reducing balance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-3">
            {summary.map((s) => (
              <Card
                key={s.label}
                className={s.accent ? "gradient-primary text-primary-foreground shadow-elegant" : ""}
              >
                <CardContent className="p-5">
                  <s.icon className="mb-2 h-5 w-5 opacity-80" />
                  <div className="text-xs opacity-80">{s.label}</div>
                  <div className="mt-1 text-xl font-bold sm:text-2xl">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("calc_schedule")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead>{t("calc_month")}</TableHead>
                      <TableHead className="text-right">{t("calc_emi")}</TableHead>
                      <TableHead className="text-right">{t("calc_principal")}</TableHead>
                      <TableHead className="text-right">{t("calc_interest")}</TableHead>
                      <TableHead className="text-right">{t("calc_balance")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.schedule.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">{formatBDT(row.emi, true)}</TableCell>
                        <TableCell className="text-right">{formatBDT(row.principal, true)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatBDT(row.interest, true)}
                        </TableCell>
                        <TableCell className="text-right">{formatBDT(row.balance, true)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
