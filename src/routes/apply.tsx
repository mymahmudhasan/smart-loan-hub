import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { HandCoins, ArrowRight, Loader2, Check, UserCog } from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { calculateLoan, MAX_MONTHS, eligibleLoanAmount } from "@/lib/loan";
import { formatBDT } from "@/lib/format";
import { useAuth } from "@/context/auth";
import { submitLoanApplication } from "@/lib/member.functions";
import { getMyProfile } from "@/lib/profile.functions";

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

// Keys used to measure profile completeness (mirrors /profile, excluding loan_purpose)
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

const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "পূর্ণ নাম লিখুন").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)"),
  nid: z.string().trim().min(10, "সঠিক এনআইডি নম্বর দিন").max(20),
  address: z.string().trim().min(5, "ঠিকানা লিখুন").max(300),
  occupation: z.string().trim().min(2, "পেশা লিখুন").max(100),
  monthlyIncome: z.number().positive("মাসিক আয় লিখুন"),
  purpose: z.string().min(1, "লোনের উদ্দেশ্য নির্বাচন করুন"),
});

function Apply() {
  const { user, loading: authLoading } = useAuth();
  const maxLoan = eligibleLoanAmount(memberBalance);
  const [amount, setAmount] = useState(Math.min(300000, maxLoan));
  const [months, setMonths] = useState(24);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const result = useMemo(() => calculateLoan(amount, months), [amount, months]);
  const apply = useServerFn(submitLoanApplication);
  const fetchProfile = useServerFn(getMyProfile);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  // Profile completeness (same measure as /profile page)
  const completion = useMemo(() => {
    const p = (profileData?.profile ?? null) as Record<string, unknown> | null;
    if (!p) return 0;
    const filled = COMPLETION_KEYS.filter((k) => {
      const v = p[k];
      return v != null && String(v).trim() !== "";
    }).length;
    return Math.round((filled / COMPLETION_KEYS.length) * 100);
  }, [profileData]);

  const profileReady = completion >= 50;

  // Auto-sync saved profile data into the application form
  useEffect(() => {
    const p = (profileData?.profile ?? null) as Record<string, unknown> | null;
    if (!p) return;
    const s = (k: string) => (p[k] == null ? "" : String(p[k]));
    setFullName(s("full_name"));
    setPhone(s("phone"));
    setNid(s("nid_number"));
    setAddress(s("address"));
    setOccupation(s("occupation"));
    setMonthlyIncome(s("monthly_income"));
  }, [profileData]);

  const mut = useMutation({
    mutationFn: () =>
      apply({
        data: {
          amount,
          months,
          emi: Math.round(result.emi),
          purpose: [
            `নাম: ${fullName}`,
            `মোবাইল: ${phone}`,
            `এনআইডি: ${nid}`,
            `ঠিকানা: ${address}`,
            `পেশা: ${occupation}`,
            `মাসিক আয়: ${monthlyIncome}`,
            `উদ্দেশ্য: ${purpose}`,
            details ? `বিস্তারিত: ${details}` : "",
          ]
            .filter(Boolean)
            .join(" | ")
            .slice(0, 500),
        },
      }),
    onSuccess: () => setShowSuccess(true),
    onError: (e) =>
      toast.error("আবেদন ব্যর্থ হয়েছে", { description: (e as Error).message }),
  });

  const submit = () => {
    if (!user) {
      toast.error("লোনের আবেদন করতে অনুগ্রহ করে লগ ইন করুন");
      return;
    }
    if (!profileReady) {
      toast.error("আগে আপনার প্রোফাইল কমপক্ষে ৫০% পূরণ করুন");
      return;
    }
    const parsed = applicationSchema.safeParse({
      fullName,
      phone,
      nid,
      address,
      occupation,
      monthlyIncome: Number(monthlyIncome),
      purpose,
    });
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
    mut.mutate();
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

  // ---- Gate: profile less than 50% complete ----
  if (!profileReady) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <UserCog className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">আগে প্রোফাইল পূরণ করুন</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          লোনের আবেদন করার আগে আপনার প্রোফাইল কমপক্ষে ৫০% পূরণ করতে হবে। এতে
          আপনার তথ্য স্বয়ংক্রিয়ভাবে আবেদন ফর্মে যুক্ত হবে।
        </p>
        <div className="mx-auto mt-6 max-w-xs">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">প্রোফাইল সম্পূর্ণতা</span>
            <span className="font-semibold">{completion}%</span>
          </div>
          <Progress value={completion} />
        </div>
        <Button variant="hero" size="lg" className="mt-6" asChild>
          <Link to="/profile">
            প্রোফাইল পূরণ করুন <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <HandCoins className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">লোন আবেদন ফর্ম</h1>
        <p className="mt-2 text-muted-foreground">
          আপনার সর্বোচ্চ লোন লিমিট:{" "}
          <span className="font-semibold text-foreground">{formatBDT(maxLoan)}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>আবেদনকারীর তথ্য</CardTitle>
            <p className="text-sm text-muted-foreground">
              আপনার প্রোফাইল থেকে তথ্য স্বয়ংক্রিয়ভাবে পূরণ হয়েছে। প্রয়োজনে
              সম্পাদনা করুন।
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">পূর্ণ নাম</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম"
              />
              {errors.fullName && (
                <p className="text-[0.8rem] text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">মোবাইল নম্বর</Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-[0.8rem] text-destructive">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nid">জাতীয় পরিচয়পত্র (এনআইডি)</Label>
                <Input
                  id="nid"
                  inputMode="numeric"
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  placeholder="এনআইডি নম্বর"
                />
                {errors.nid && (
                  <p className="text-[0.8rem] text-destructive">{errors.nid}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">বর্তমান ঠিকানা</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="গ্রাম/বাসা, থানা, জেলা"
                rows={2}
              />
              {errors.address && (
                <p className="text-[0.8rem] text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occupation">পেশা</Label>
                <Input
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="যেমন: ব্যবসায়ী, চাকরিজীবী"
                />
                {errors.occupation && (
                  <p className="text-[0.8rem] text-destructive">
                    {errors.occupation}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">মাসিক আয় (টাকা)</Label>
                <Input
                  id="income"
                  inputMode="numeric"
                  value={monthlyIncome}
                  onChange={(e) =>
                    setMonthlyIncome(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="যেমন: ৩০০০০"
                />
                {errors.monthlyIncome && (
                  <p className="text-[0.8rem] text-destructive">
                    {errors.monthlyIncome}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>লোনের উদ্দেশ্য</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="উদ্দেশ্য নির্বাচন করুন" />
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

            <div className="space-y-2">
              <Label htmlFor="details">বিস্তারিত (ঐচ্ছিক)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="লোন সম্পর্কে অতিরিক্ত তথ্য"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>লোনের পরিমাণ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>পরিমাণ</Label>
                  <span className="font-semibold">{formatBDT(amount)}</span>
                </div>
                <Slider
                  value={[amount]}
                  min={10000}
                  max={maxLoan}
                  step={5000}
                  onValueChange={(v) => setAmount(v[0])}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>মেয়াদ</Label>
                  <span className="font-semibold">{months} মাস</span>
                </div>
                <Slider
                  value={[months]}
                  min={3}
                  max={MAX_MONTHS}
                  step={1}
                  onValueChange={(v) => setMonths(v[0])}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-hero text-on-hero shadow-elegant">
            <CardHeader>
              <CardTitle>সারসংক্ষেপ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { l: "মাসিক ইএমআই", v: formatBDT(result.emi, true) },
                { l: "মোট সুদ", v: formatBDT(result.totalInterest, true) },
                { l: "মোট পরিশোধযোগ্য", v: formatBDT(result.totalPayable, true) },
              ].map((row) => (
                <div
                  key={row.l}
                  className="flex items-center justify-between border-b border-white/20 pb-3"
                >
                  <span className="opacity-80">{row.l}</span>
                  <span className="text-lg font-bold">{row.v}</span>
                </div>
              ))}
              <Button
                variant="glass"
                size="lg"
                className="w-full"
                onClick={submit}
                disabled={mut.isPending}
              >
                {mut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    আবেদন জমা দিন <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs opacity-80">
                যাচাই ও অ্যাডমিন অনুমোদন সাপেক্ষে।{" "}
                <Link to="/terms" className="underline">
                  শর্তাবলী প্রযোজ্য
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent
          className="max-w-sm text-center"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground">
                <Check className="h-7 w-7" />
              </span>
            </span>
            <DialogTitle className="text-2xl">আবেদন সম্পন্ন!</DialogTitle>
            <DialogDescription className="text-base">
              আপনার লোনের আবেদন সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাইয়ের পর আপনাকে
              জানানো হবে।
            </DialogDescription>
            <Button asChild size="lg" className="w-full">
              <Link to="/dashboard">ঠিক আছে</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
