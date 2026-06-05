import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HandCoins, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateLoan, MAX_MONTHS, eligibleLoanAmount } from "@/lib/loan";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { submitLoanApplication } from "@/lib/member.functions";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply for a Loan | Smart Loan" },
      { name: "description", content: "Apply for a membership loan up to 10× your balance at 8% annual interest." },
    ],
  }),
  component: Apply,
});

const memberBalance = 50000;

function Apply() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const maxLoan = eligibleLoanAmount(memberBalance);
  const [amount, setAmount] = useState(Math.min(300000, maxLoan));
  const [months, setMonths] = useState(24);
  const result = useMemo(() => calculateLoan(amount, months), [amount, months]);
  const apply = useServerFn(submitLoanApplication);

  const mut = useMutation({
    mutationFn: () => apply({ data: { amount, months, emi: Math.round(result.emi) } }),
    onSuccess: () =>
      toast.success("Loan application submitted", {
        description: `${formatBDT(amount)} for ${months} months. Pending admin review.`,
      }),
    onError: (e) => toast.error("Submission failed", { description: (e as Error).message }),
  });

  const submit = () => {
    if (!user) {
      toast.error("Please sign in to apply for a loan");
      return;
    }
    mut.mutate();
  };


  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <HandCoins className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("apply_now")}</h1>
        <p className="mt-2 text-muted-foreground">
          Available limit: <span className="font-semibold text-foreground">{formatBDT(maxLoan)}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>{t("calc_amount")}</Label>
                <span className="font-semibold">{formatBDT(amount)}</span>
              </div>
              <Slider value={[amount]} min={10000} max={maxLoan} step={5000} onValueChange={(v) => setAmount(v[0])} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>{t("calc_duration")}</Label>
                <span className="font-semibold">{months} months</span>
              </div>
              <Slider value={[months]} min={3} max={MAX_MONTHS} step={1} onValueChange={(v) => setMonths(v[0])} />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-hero text-primary-foreground shadow-elegant">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { l: t("calc_emi"), v: formatBDT(result.emi, true) },
              { l: t("calc_interest"), v: formatBDT(result.totalInterest, true) },
              { l: t("calc_total"), v: formatBDT(result.totalPayable, true) },
            ].map((row) => (
              <div key={row.l} className="flex items-center justify-between border-b border-primary-foreground/20 pb-3">
                <span className="opacity-80">{row.l}</span>
                <span className="text-lg font-bold">{row.v}</span>
              </div>
            ))}
            <Button variant="glass" size="lg" className="w-full" onClick={submit} disabled={mut.isPending}>
              {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Application <ArrowRight className="h-4 w-4" /></>}
            </Button>
            <p className="text-center text-xs opacity-80">
              Subject to verification & admin approval.{" "}
              <Link to="/terms" className="underline">Terms apply</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
