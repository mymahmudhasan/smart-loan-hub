import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Receipt, CheckCircle2, ShieldCheck } from "lucide-react";
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
import { createPaymentCharge } from "@/lib/payment.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments | Smart Loan" },
      { name: "description", content: "Deposit funds, withdraw, and pay EMIs securely via our online payment gateway." },
    ],
  }),
  component: Payments,
});

const withdrawMethods = [
  { id: "bkash", name: "bKash", hint: "Instant mobile wallet" },
  { id: "nagad", name: "Nagad", hint: "Instant mobile wallet" },
];

const logs = [
  { label: "EMI Payment #8", method: "Online", date: "01 Jun 2026", amount: 13568, status: "Completed" },
  { label: "Deposit", method: "Online", date: "20 May 2026", amount: 15000, status: "Completed" },
  { label: "Withdraw", method: "bKash", date: "10 May 2026", amount: 5000, status: "Pending" },
];

// ---------- Online (gateway) deposit / EMI form ----------
function OnlinePaymentForm({ type }: { type: "deposit" | "emi_payment" }) {
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const { user } = useAuth();
  const charge = useServerFn(createPaymentCharge);

  const onlineMut = useMutation({
    mutationFn: () =>
      charge({
        data: {
          type,
          amount: Number(amount),
          origin: window.location.origin,
        },
      }),
    onSuccess: (res) => {
      if (res?.checkoutUrl) {
        toast.success("Redirecting to secure checkout…");
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Could not start checkout", {
          description: "No checkout URL returned by the gateway.",
        });
      }
    },
    onError: (e) => toast.error("Payment failed", { description: (e as Error).message }),
  });

  const validate = () => {
    const val = Number(amount);
    if (!amount || Number.isNaN(val) || val <= 0) {
      setAmountError("Please enter a valid amount.");
      return false;
    }
    if (val < 10) {
      setAmountError("Minimum amount is ৳10.");
      return false;
    }
    if (val > 5_00_000) {
      setAmountError("Maximum amount is ৳5,00,000.");
      return false;
    }
    setAmountError(undefined);
    return true;
  };

  const payOnline = () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }
    if (!validate()) return;
    onlineMut.mutate();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-4">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm font-medium">Secure online payment</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${type}-amount`}>Amount (BDT)</Label>
        <Input
          id={`${type}-amount`}
          type="number"
          placeholder="0"
          value={amount}
          min={1}
          aria-invalid={!!amountError}
          onChange={(e) => {
            setAmount(e.target.value);
            if (amountError) setAmountError(undefined);
          }}
        />
        {amountError && <p className="text-xs text-destructive">{amountError}</p>}
      </div>

      <Button
        type="button"
        variant="hero"
        size="lg"
        className="w-full"
        onClick={payOnline}
        disabled={onlineMut.isPending}
      >
        {onlineMut.isPending ? "Starting checkout…" : "Pay Online Now"}
      </Button>
    </div>
  );
}

// ---------- Manual withdrawal request form ----------
function WithdrawForm() {
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; method?: string; date?: string }>({});
  const { user } = useAuth();
  const { t } = useLanguage();
  const request = useServerFn(requestTransaction);

  const validate = () => {
    const next: typeof errors = {};
    if (!amount || amount.trim() === "") {
      next.amount = "Please enter an amount.";
    } else {
      const val = Number(amount);
      if (Number.isNaN(val) || val <= 0) next.amount = "Amount must be a positive number.";
      else if (val < 10) next.amount = "Minimum amount is ৳10.";
      else if (val > 5_00_000) next.amount = "Maximum amount is ৳5,00,000.";
    }
    if (!method || !["bkash", "nagad"].includes(method)) {
      next.method = "Please select a valid payment method.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mut = useMutation({
    mutationFn: () => request({ data: { type: "withdrawal", amount: Number(amount), method } }),
    onSuccess: () => {
      toast.success("Withdrawal request submitted", {
        description: `${formatBDT(Number(amount))} via ${withdrawMethods.find((m) => m.id === method)?.name}. Awaiting verification.`,
      });
      setAmount("");
      setDate("");
      setErrors({});
    },
    onError: (e) => toast.error("Request failed", { description: (e as Error).message }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }
    if (!validate()) return;
    mut.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="withdraw-amount">Amount (BDT)</Label>
        <Input
          id="withdraw-amount"
          type="number"
          placeholder="0"
          value={amount}
          min={1}
          aria-invalid={!!errors.amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount) setErrors((p) => ({ ...p, amount: undefined }));
          }}
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="withdraw-date">Transaction Date</Label>
        <Input
          id="withdraw-date"
          type="date"
          value={date}
          aria-invalid={!!errors.date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) setErrors((p) => ({ ...p, date: undefined }));
          }}
        />
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>

      <div className="space-y-2">
        <Label>Withdraw To</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {withdrawMethods.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => {
                setMethod(m.id as "bkash" | "nagad");
                if (errors.method) setErrors((p) => ({ ...p, method: undefined }));
              }}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                method === m.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50",
              )}
              aria-pressed={method === m.id}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{m.name}</span>
                {method === m.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <span className="text-xs text-muted-foreground">{m.hint}</span>
            </button>
          ))}
        </div>
        {errors.method && <p className="text-xs text-destructive">{errors.method}</p>}
      </div>

      <Button type="submit" variant="outline" size="lg" className="w-full" disabled={mut.isPending}>
        {mut.isPending ? "Processing…" : t("withdraw")}
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
                <OnlinePaymentForm type="deposit" />
              </TabsContent>
              <TabsContent value="withdraw" className="mt-6">
                <WithdrawForm />
              </TabsContent>
              <TabsContent value="emi" className="mt-6">
                <OnlinePaymentForm type="emi_payment" />
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
