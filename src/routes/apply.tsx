import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  HandCoins,
  ArrowRight,
  Loader2,
  UserCog,
  ShieldCheck,
  User,
  Wallet,
  CalendarClock,
  FileText,
  Receipt,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  ListChecks,
} from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { calculateLoan, eligibleLoanAmount } from "@/lib/loan";
import { formatBDT } from "@/lib/format";
import { useAuth } from "@/context/auth";
import { submitLoanApplication } from "@/lib/member.functions";
import { getMyProfile } from "@/lib/profile.functions";
import { createPaymentCharge } from "@/lib/payment.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "লোন আবেদন ফর্ম | স্মার্ট লোন" },
      {
        name: "description",
        content:
          "অনলাইনে সহজে লোনের আবেদন করুন। আপনার জমার ১০ গুণ পর্যন্ত মাত্র ৮% বার্ষিক সুদে লোন নিন।",
      },
    ],
  }),
  component: Apply,
});

const memberBalance = 50000;
const COLLATERAL_RATE = 0.1; // 10% collateral / জামানত

// Keys used to measure profile completeness (mirrors /profile)
const COMPLETION_KEYS = [
  "full_name",
  "phone",
  "date_of_birth",
  "gender",
  "marital_status",
  "father_name",
  "mother_name",
  "nid_number",
  "address",
  "permanent_address",
  "city",
  "postal_code",
  "occupation",
  "employment_type",
  "employer_name",
  "monthly_income",
  "mobile_banking_provider",
  "mobile_banking_number",
  "emergency_contact_name",
  "emergency_contact_phone",
] as const;

const PURPOSES = [
  "ব্যবসা / Business",
  "শিক্ষা / Education",
  "চিকিৎসা / Medical",
  "গৃহ নির্মাণ / Home",
  "কৃষি / Agriculture",
  "ব্যক্তিগত / Personal",
  "অন্যান্য / Other",
];

const PAYMENT_METHODS = [
  { id: "bkash", name: "bKash", color: "#E2136E", tag: "মোবাইল ওয়ালেট" },
  { id: "nagad", name: "Nagad", color: "#EE7622", tag: "মোবাইল ওয়ালেট" },
  { id: "rocket", name: "Rocket", color: "#8C3494", tag: "মোবাইল ব্যাংকিং" },
] as const;

const TENURES = [3, 6, 9, 12, 18, 24, 36];

const formSchema = z.object({
  fullName: z.string().trim().min(2, "পূর্ণ নাম লিখুন").max(100),
  amount: z.number().positive("লোনের পরিমাণ নির্বাচন করুন"),
  months: z.number().positive("মেয়াদ নির্বাচন করুন"),
  purpose: z.string().min(1, "লোনের কারণ নির্বাচন করুন"),
});

type Step = "form" | "summary" | "payment";

function Apply() {
  const { user, loading: authLoading } = useAuth();
  const maxLoan = eligibleLoanAmount(memberBalance);

  // amount options up to the eligible limit
  const amountOptions = useMemo(
    () =>
      [10000, 20000, 30000, 50000, 100000, 200000, 300000, 400000, 500000].filter(
        (a) => a <= maxLoan,
      ),
    [maxLoan],
  );

  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [months, setMonths] = useState<number>(0);
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTerms, setShowTerms] = useState(false);
  const [method, setMethod] = useState<string>("");

  const collateral = useMemo(() => Math.round(amount * COLLATERAL_RATE), [amount]);
  const result = useMemo(
    () => calculateLoan(amount || 0, months || 1),
    [amount, months],
  );

  const apply = useServerFn(submitLoanApplication);
  const fetchProfile = useServerFn(getMyProfile);
  const charge = useServerFn(createPaymentCharge);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  const completion = useMemo(() => {
    const p = (profileData?.profile ?? null) as Record<string, unknown> | null;
    if (!p) return 0;
    const filled = COMPLETION_KEYS.filter((k) => {
      const v = p[k];
      return v != null && String(v).trim() !== "";
    }).length;
    return Math.round((filled / COMPLETION_KEYS.length) * 100);
  }, [profileData]);

  const kyc = (profileData?.kyc ?? null) as { status: string } | null;
  const kycReady = !!kyc && kyc.status !== "rejected";
  const profileReady = completion >= 80 && kycReady;

  // Auto-sync the applicant name from the saved profile.
  useEffect(() => {
    const p = (profileData?.profile ?? null) as Record<string, unknown> | null;
    if (!p) return;
    if (p.full_name) setFullName(String(p.full_name));
  }, [profileData]);

  // Submit the loan application (recorded with the chosen collateral note).
  const applyMut = useMutation({
    mutationFn: () =>
      apply({
        data: {
          amount,
          months,
          emi: Math.round(result.emi),
          purpose: [
            `নাম: ${fullName}`,
            `উদ্দেশ্য: ${purpose}`,
            `জামানত: ${collateral}`,
          ]
            .join(" | ")
            .slice(0, 500),
        },
      }),
    onError: (e) =>
      toast.error("আবেদন ব্যর্থ হয়েছে", { description: (e as Error).message }),
  });

  // Start the collateral (জামানত) deposit via the payment gateway.
  const chargeMut = useMutation({
    mutationFn: () =>
      charge({
        data: { type: "deposit", amount: collateral, origin: window.location.origin },
      }),
    onSuccess: (res) => {
      if (res?.checkoutUrl) {
        toast.success("নিরাপদ পেমেন্টে নিয়ে যাওয়া হচ্ছে…");
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("পেমেন্ট শুরু করা যায়নি");
      }
    },
    onError: (e) =>
      toast.error("পেমেন্ট ব্যর্থ হয়েছে", { description: (e as Error).message }),
  });

  const goToSummary = () => {
    const parsed = formSchema.safeParse({ fullName, amount, months, purpose });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("ফর্মটি সঠিকভাবে পূরণ করুন");
      return;
    }
    setErrors({});
    setStep("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // After accepting terms: record the application, then move to payment.
  const proceedToPayment = () => {
    setShowTerms(false);
    applyMut.mutate(undefined, {
      onSuccess: () => {
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  const payCollateral = () => {
    if (!method) {
      toast.error("একটি পেমেন্ট মাধ্যম নির্বাচন করুন");
      return;
    }
    chargeMut.mutate();
  };

  // ---- Gate: not logged in ----
  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <HandCoins className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">লগইন প্রয়োজন</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          লোনের আবেদন করতে অনুগ্রহ করে লগ ইন করুন।
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="hero" asChild>
            <Link to="/login">লগ ইন</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signup">শুরু করুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ---- Loading profile ----
  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---- Gate: profile less than 80% complete OR KYC not submitted ----
  if (!profileReady) {
    const kycMissing = !kyc || kyc.status === "rejected";
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <UserCog className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">আগে প্রোফাইল ও কেওয়াইসি সম্পূর্ণ করুন</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          লোনের আবেদন করার আগে আপনার প্রোফাইল কমপক্ষে ৮০% এবং কেওয়াইসি জমা দিতে
          হবে। এতে আপনার তথ্য স্বয়ংক্রিয়ভাবে আবেদন ফর্মে যুক্ত হবে।
        </p>
        <div className="mx-auto mt-6 max-w-xs space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">প্রোফাইল সম্পূর্ণতা</span>
              <span className="font-semibold">{completion}%</span>
            </div>
            <Progress value={completion} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" /> কেওয়াইসি
            </span>
            <span
              className={
                kycMissing
                  ? "text-destructive font-semibold"
                  : "text-accent font-semibold"
              }
            >
              {kycMissing ? "অসম্পূর্ণ" : "জমা হয়েছে"}
            </span>
          </div>
        </div>
        <Button variant="hero" size="lg" className="mt-6" asChild>
          <Link to="/profile">
            প্রোফাইল ও কেওয়াইসি সম্পূর্ণ করুন <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const steps = [
    { key: "form", label: "আবেদন" },
    { key: "summary", label: "সারাংশ" },
    { key: "payment", label: "জামানত" },
  ] as const;
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 lg:py-16">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
                  i <= activeIndex
                    ? "gradient-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i < activeIndex ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  i <= activeIndex ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mb-5 h-0.5 w-8 rounded-full transition-all",
                  i < activeIndex ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* ---------- STEP 1: FORM ---------- */}
      {step === "form" && (
        <Card className="overflow-hidden border-primary/10 shadow-elegant">
          <div className="gradient-primary px-6 py-6 text-center text-primary-foreground">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <HandCoins className="h-6 w-6" />
            </span>
            <h1 className="mt-3 text-2xl font-bold">লোন এপ্লিকেশন ফর্ম</h1>
            <p className="mt-1 text-sm opacity-90">
              সর্বোচ্চ লিমিট: {formatBDT(maxLoan)}
            </p>
          </div>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">পুরো নাম:</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম"
                  className="pl-9"
                />
              </div>
              {errors.fullName && (
                <p className="text-[0.8rem] text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>লোনের পরিমাণ:</Label>
              <Select
                value={amount ? String(amount) : ""}
                onValueChange={(v) => setAmount(Number(v))}
              >
                <SelectTrigger>
                  <span className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="নির্বাচন করুন" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {amountOptions.map((a) => (
                    <SelectItem key={a} value={String(a)}>
                      {formatBDT(a)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.amount && (
                <p className="text-[0.8rem] text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>মেয়াদ (মাস):</Label>
              <Select
                value={months ? String(months) : ""}
                onValueChange={(v) => setMonths(Number(v))}
              >
                <SelectTrigger>
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="নির্বাচন করুন" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {TENURES.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} মাস
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.months && (
                <p className="text-[0.8rem] text-destructive">{errors.months}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>লোনের কারণ:</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="নির্বাচন করুন" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {PURPOSES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.purpose && (
                <p className="text-[0.8rem] text-destructive">{errors.purpose}</p>
              )}
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={goToSummary}
            >
              <CheckCircle2 className="h-4 w-4" /> আবেদন করুন
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ---------- STEP 2: SUMMARY ---------- */}
      {step === "summary" && (
        <Card className="overflow-hidden border-primary/10 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">লোনের সারাংশ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-0">
            {/* Account details */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <Receipt className="h-4 w-4" /> অ্যামাউন্ট বিস্তারিত
              </h3>
              <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
                <Row label="লোন নিয়েছেন:" value={formatBDT(amount)} />
                <Row
                  label="জামানত (Collateral):"
                  value={formatBDT(collateral)}
                  highlight
                />
              </div>
            </div>

            {/* Repayment plan */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <ListChecks className="h-4 w-4" /> কিস্তি পরিশোধের প্ল্যান
              </h3>
              <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
                <Row
                  label="মোট পরিশোধযোগ্য:"
                  value={formatBDT(result.totalPayable, true)}
                  bold
                />
                <Row
                  label="মোট ইন্টারেস্ট:"
                  value={formatBDT(result.totalInterest, true)}
                />
                <Row label="ইন্টারেস্ট রেট:" value="৮.০%" />
                <Row label="মাসিক ইএমআই:" value={formatBDT(result.emi, true)} />
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => setShowTerms(true)}
            >
              এগিয়ে যান <ArrowRight className="h-4 w-4" />
            </Button>

            {/* Repayment schedule */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <CalendarClock className="h-4 w-4" /> পরিশোধের সময়সূচি
              </h3>
              <div className="max-h-72 space-y-2 overflow-auto pr-1">
                {result.schedule.map((r) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + r.month);
                  const dateStr = d.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={r.month}
                      className="flex items-center justify-between gap-3 rounded-lg border-l-4 border-primary bg-card p-3 shadow-soft"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{dateStr}</p>
                        <p className="text-xs text-muted-foreground">
                          আসল: {formatBDT(r.principal, true)} | ইন্টারেস্ট:{" "}
                          {formatBDT(r.interest, true)}
                        </p>
                      </div>
                      <span className="shrink-0 font-bold text-primary">
                        {formatBDT(r.emi, true)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep("form")}
            >
              ফিরে যান
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ---------- STEP 3: PAYMENT (collateral) ---------- */}
      {step === "payment" && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm">
              <strong>{formatBDT(amount)}</strong> লোন পেতে{" "}
              <strong>{formatBDT(collateral)}</strong> জামানত করুন। আপনি
              বিকাশ/নগদ/রকেট এর মাধ্যমে টাকা জামানত করতে পারবেন।
            </p>
          </div>

          <Card className="border-primary/10 shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle>পেমেন্ট মাধ্যম নির্বাচন করুন</CardTitle>
              <p className="text-sm text-muted-foreground">
                জামানত: {formatBDT(collateral)}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-0">
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    aria-pressed={method === m.id}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 bg-card p-4 transition-all",
                      method === m.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.name.slice(0, 2)}
                    </span>
                    <span className="text-sm font-semibold">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground">{m.tag}</span>
                    {method === m.id && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={payCollateral}
                disabled={chargeMut.isPending}
              >
                {chargeMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {formatBDT(collateral)} জামানত করুন{" "}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                আপনার আবেদন জমা হয়েছে। জামানত পরিশোধের পর অ্যাডমিন যাচাই করবেন।{" "}
                <Link to="/terms" className="underline">
                  শর্তাবলী প্রযোজ্য
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------- Terms / special-notice modal ---------- */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-md">
          <div className="space-y-5">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg text-primary">
                <AlertCircle className="h-5 w-5" /> বিশেষ দৃষ্টি আকর্ষণ:
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-foreground">
                আপনি {formatBDT(amount)} টাকা লোন নিতে চাইলে আপনাকে{" "}
                {formatBDT(collateral)} টাকা জামানত জমা দিতে হবে। আপনি জামানতের টাকা
                বিকাশ অথবা নগদের মাধ্যমে প্রদান করতে পারবেন।
              </DialogDescription>
            </div>
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-primary">
                <ListChecks className="h-4 w-4" /> শর্তাবলী:
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                আপনার লোন এপ্রুভ হওয়ার পরে লোনের টাকা ও জামানতের টাকা একসাথে
                ব্যালেন্সে পেয়ে যাবেন। অনুগ্রহ করে আগে জামানত প্রদান করুন।
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={proceedToPayment}
              disabled={applyMut.isPending}
            >
              {applyMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "পরবর্তী"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold",
          bold && "text-base font-bold text-primary",
          highlight && "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}
