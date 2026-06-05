import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Receipt, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { requestTransaction } from "@/lib/member.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments | Smart Loan" },
      { name: "description", content: "Deposit funds, withdraw, and pay EMIs via bKash, Nagad or bank transfer." },
    ],
  }),
  component: Payments,
});

const methods = [
  { id: "bkash", name: "bKash", hint: "Instant mobile wallet" },
  { id: "nagad", name: "Nagad", hint: "Instant mobile wallet" },
  { id: "bank", name: "Bank Transfer", hint: "Manual verification" },
];

const logs = [
  { label: "EMI Payment #8", method: "bKash", date: "01 Jun 2026", amount: 13568, status: "Completed" },
  { label: "Deposit", method: "Nagad", date: "20 May 2026", amount: 15000, status: "Completed" },
  { label: "Withdraw", method: "Bank Transfer", date: "10 May 2026", amount: 5000, status: "Pending" },
];

function PaymentForm({ action, cta, type }: { action: string; cta: string; type: "deposit" | "withdrawal" | "emi_payment" }) {
  const [method, setMethod] = useState<"bkash" | "nagad" | "bank">("bkash");
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const request = useServerFn(requestTransaction);

  const mut = useMutation({
    mutationFn: () => request({ data: { type, amount: Number(amount), method } }),
    onSuccess: () => {
      toast.success(`${action} request submitted`, {
        description: `${formatBDT(Number(amount))} via ${methods.find((m) => m.id === method)?.name}. Awaiting verification.`,
      });
      setAmount("");
    },
    onError: (e) => toast.error("Request failed", { description: (e as Error).message }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }
    mut.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label>Amount (BDT)</Label>
        <Input
          type="number"
          placeholder="0"
          value={amount}
          min={1}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {methods.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                method === m.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{m.name}</span>
                {method === m.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <span className="text-xs text-muted-foreground">{m.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full">
        {cta}
      </Button>
    </form>
  );
}

function Payments() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <Wallet className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("nav_payments")}</h1>
        <p className="mt-2 text-muted-foreground">Manage deposits, withdrawals and EMI payments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="deposit">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deposit">
                  <ArrowDownToLine className="mr-1.5 h-4 w-4" /> {t("deposit")}
                </TabsTrigger>
                <TabsTrigger value="withdraw">
                  <ArrowUpFromLine className="mr-1.5 h-4 w-4" /> {t("withdraw")}
                </TabsTrigger>
                <TabsTrigger value="emi">
                  <Receipt className="mr-1.5 h-4 w-4" /> EMI
                </TabsTrigger>
              </TabsList>
              <TabsContent value="deposit" className="mt-6">
                <PaymentForm action="Deposit" cta={t("deposit")} />
              </TabsContent>
              <TabsContent value="withdraw" className="mt-6">
                <PaymentForm action="Withdrawal" cta={t("withdraw")} />
              </TabsContent>
              <TabsContent value="emi" className="mt-6">
                <PaymentForm action="EMI payment" cta={t("pay_emi")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Transaction Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {logs.map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.method} · {l.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBDT(l.amount)}</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px]",
                        l.status === "Completed" ? "text-accent" : "text-warning",
                      )}
                    >
                      {l.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
