import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Receipt, ShieldCheck, ArrowLeftRight, IdCard, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";

import { useAuth } from "@/context/auth";
import { requestTransaction } from "@/lib/member.functions";
import { getMyProfile } from "@/lib/profile.functions";
import { createPaymentCharge } from "@/lib/payment.functions";
import { cn } from "@/lib/utils";

const MIN_WITHDRAW = 500;

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments | Smart Loan" },
      { name: "description", content: "Deposit funds, withdraw, and pay EMIs securely via our online payment gateway." },
    ],
  }),
  component: Payments,
});

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
  const { lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
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
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bkash" | "nagad" | "">("");
  const [account, setAccount] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; method?: string; account?: string }>({});
  const { user } = useAuth();
  const request = useServerFn(requestTransaction);

  const fetchProfile = useServerFn(getMyProfile);
  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });
  const balance = Number(profileData?.profile?.member_balance ?? 0);

  const validate = () => {
    const next: typeof errors = {};
    const val = Number(amount);
    if (!amount || amount.trim() === "") next.amount = "পরিমাণ লিখুন।";
    else if (Number.isNaN(val) || val <= 0) next.amount = "সঠিক পরিমাণ লিখুন।";
    else if (val < MIN_WITHDRAW) next.amount = `সর্বনিম্ন উত্তোলন ৳${MIN_WITHDRAW}।`;
    else if (val > 5_00_000) next.amount = "সর্বোচ্চ ৳৫,০০,০০০।";
    if (!method) next.method = "মাধ্যম নির্বাচন করুন।";
    if (!account || account.trim().length < 11) next.account = "সঠিক একাউন্ট নম্বর লিখুন।";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mut = useMutation({
    mutationFn: () =>
      request({ data: { type: "withdrawal", amount: Number(amount), method: (method || "bkash") as "bkash" | "nagad" } }),
    onSuccess: () => {
      toast.success("উত্তোলনের অনুরোধ জমা হয়েছে", {
        description: `${formatBDT(Number(amount))} — যাচাইয়ের অপেক্ষায়।`,
      });
      setAmount("");
      setMethod("");
      setAccount("");
      setErrors({});
    },
    onError: (e) => toast.error("অনুরোধ ব্যর্থ হয়েছে", { description: (e as Error).message }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("চালিয়ে যেতে সাইন ইন করুন");
      return;
    }
    if (!validate()) return;
    mut.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {/* Notice banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm font-medium leading-relaxed text-primary">
          উত্তোলনের সর্বোচ্চ ২-৩ মিনিটের মধ্যে টাকা আপনার বিকাশ বা নগদ একাউন্টে পেয়ে যাবেন
        </p>
      </div>

      {/* Current balance */}
      <div className="space-y-2">
        <Label>আপনার বর্তমান ব্যালেন্স</Label>
        <div className="flex items-center justify-center rounded-xl border border-primary/20 bg-primary/5 py-5">
          <span className="text-2xl font-bold text-primary">৳ {formatBDT(balance).replace("৳", "").trim()}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="withdraw-amount">উত্তোলনের পরিমাণ লিখুন</Label>
        <div className="relative">
          <Coins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="withdraw-amount"
            type="number"
            placeholder="যেমনঃ ১০০০"
            value={amount}
            min={MIN_WITHDRAW}
            className="pl-9"
            aria-invalid={!!errors.amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((p) => ({ ...p, amount: undefined }));
            }}
          />
        </div>
        {errors.amount ? (
          <p className="text-xs text-destructive">{errors.amount}</p>
        ) : (
          <p className="text-xs font-medium text-primary">Minimum withdraw {MIN_WITHDRAW} BDT</p>
        )}
      </div>

      {/* Method */}
      <div className="space-y-2">
        <Label>উত্তোলনের মাধ্যম</Label>
        <Select
          value={method}
          onValueChange={(v) => {
            setMethod(v as "bkash" | "nagad");
            if (errors.method) setErrors((p) => ({ ...p, method: undefined }));
          }}
        >
          <SelectTrigger aria-invalid={!!errors.method} className="w-full">
            <span className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="নির্বাচন করুন" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bkash">বিকাশ (bKash)</SelectItem>
            <SelectItem value="nagad">নগদ (Nagad)</SelectItem>
          </SelectContent>
        </Select>
        {errors.method && <p className="text-xs text-destructive">{errors.method}</p>}
      </div>

      {/* Account number */}
      <div className="space-y-2">
        <Label htmlFor="withdraw-account">একাউন্ট/নম্বর</Label>
        <div className="relative">
          <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="withdraw-account"
            type="tel"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            value={account}
            className="pl-9"
            aria-invalid={!!errors.account}
            onChange={(e) => {
              setAccount(e.target.value);
              if (errors.account) setErrors((p) => ({ ...p, account: undefined }));
            }}
          />
        </div>
        {errors.account && <p className="text-xs text-destructive">{errors.account}</p>}
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={mut.isPending}>
        {mut.isPending ? "প্রসেসিং…" : "উত্তোলন করুন"}
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
