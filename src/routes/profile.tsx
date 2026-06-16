import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserCircle,
  MapPin,
  Briefcase,
  ShieldCheck,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Save,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, updateMyProfile, submitKyc } from "@/lib/profile.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & KYC | Smart Loan" },
      {
        name: "description",
        content: "Complete your verified member profile and KYC identity verification to unlock loans.",
      },
    ],
  }),
  component: ProfilePage,
});

type FormState = Record<string, string>;

const PROFILE_KEYS = [
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
  "loan_purpose",
] as const;

function ProfilePage() {
  const { lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const { user, loading: authLoading } = useAuth();

  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const sendKyc = useServerFn(submitKyc);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);

  // KYC upload state
  const [nidNumber, setNidNumber] = useState("");
  const [files, setFiles] = useState<{ front?: File; back?: File; selfie?: File }>({});
  const [submittingKyc, setSubmittingKyc] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      const p = data.profile as Record<string, unknown>;
      const next: FormState = {};
      for (const k of PROFILE_KEYS) {
        const v = p[k];
        next[k] = v == null ? "" : String(v);
      }
      setForm(next);
      setNidNumber((p.nid_number as string) ?? "");
    }
  }, [data]);

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const onInput =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(k)(e.target.value);

  const completion = useMemo(() => {
    const checkKeys = PROFILE_KEYS.filter((k) => k !== "loan_purpose");
    const filled = checkKeys.filter((k) => (form[k] ?? "").trim() !== "").length;
    return Math.round((filled / checkKeys.length) * 100);
  }, [form]);

  const kyc = data?.kyc ?? null;

  const handleSave = async () => {
    if (!form.full_name || form.full_name.trim().length < 2) {
      toast.error(L("Please enter your full name", "আপনার পূর্ণ নাম লিখুন"));
      return;
    }
    if (!form.phone || form.phone.trim().length < 6) {
      toast.error(L("Please enter a valid phone number", "সঠিক মোবাইল নম্বর লিখুন"));
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const k of PROFILE_KEYS) {
        if (k === "monthly_income") {
          const n = parseFloat(form[k] ?? "");
          payload[k] = Number.isFinite(n) ? n : null;
        } else {
          payload[k] = (form[k] ?? "").trim() || null;
        }
      }
      payload.full_name = (form.full_name ?? "").trim();
      payload.phone = (form.phone ?? "").trim();
      await saveProfile({ data: payload });
      toast.success(L("Profile saved", "প্রোফাইল সংরক্ষিত হয়েছে"));
      refetch();
    } catch (err) {
      toast.error(L("Could not save", "সংরক্ষণ করা যায়নি"), {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadOne = async (file: File, label: string) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user!.id}/${label}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("kyc-documents").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    return path;
  };

  const handleKyc = async () => {
    if (nidNumber.trim().length < 5) {
      toast.error(L("Enter your National ID number", "জাতীয় পরিচয়পত্র নম্বর দিন"));
      return;
    }
    const hasExisting = !!(kyc?.nid_front_url && kyc?.nid_back_url && kyc?.selfie_url);
    if (!hasExisting && (!files.front || !files.back || !files.selfie)) {
      toast.error(L("Please upload all three documents", "তিনটি ডকুমেন্ট আপলোড করুন"));
      return;
    }
    setSubmittingKyc(true);
    try {
      const front = files.front ? await uploadOne(files.front, "nid_front") : kyc!.nid_front_url!;
      const back = files.back ? await uploadOne(files.back, "nid_back") : kyc!.nid_back_url!;
      const selfie = files.selfie ? await uploadOne(files.selfie, "selfie") : kyc!.selfie_url!;
      await sendKyc({
        data: {
          nid_number: nidNumber.trim(),
          nid_front_url: front,
          nid_back_url: back,
          selfie_url: selfie,
        },
      });
      toast.success(L("KYC submitted for review", "কেওয়াইসি যাচাইয়ের জন্য জমা হয়েছে"));
      setFiles({});
      refetch();
    } catch (err) {
      toast.error(L("KYC submission failed", "কেওয়াইসি জমা ব্যর্থ"), {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmittingKyc(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">{L("Sign in required", "লগইন প্রয়োজন")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {L("Log in to view and complete your member profile.", "প্রোফাইল দেখতে ও সম্পূর্ণ করতে লগইন করুন।")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="hero" asChild>
            <Link to="/login">{L("Log In", "লগ ইন")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signup">{L("Get Started", "শুরু করুন")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const kycBadge = () => {
    const s = kyc?.status;
    if (s === "approved")
      return (
        <Badge className="bg-accent/15 text-accent hover:bg-accent/15">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> {L("Verified", "যাচাইকৃত")}
        </Badge>
      );
    if (s === "pending")
      return (
        <Badge className="bg-warning/15 text-warning hover:bg-warning/15">
          <Clock className="mr-1 h-3.5 w-3.5" /> {L("Under review", "যাচাই চলছে")}
        </Badge>
      );
    if (s === "rejected")
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3.5 w-3.5" /> {L("Rejected", "প্রত্যাখ্যাত")}
        </Badge>
      );
    return (
      <Badge variant="secondary">
        <ShieldCheck className="mr-1 h-3.5 w-3.5" /> {L("Not verified", "যাচাই হয়নি")}
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:py-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{L("My Profile", "আমার প্রোফাইল")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {L(
              "Complete your details to verify your identity and qualify for loans.",
              "লোনের যোগ্য হতে আপনার তথ্য পূরণ করে পরিচয় যাচাই করুন।",
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {kycBadge()}
        </div>
      </div>

      {/* Completion */}
      <Card className="mb-6 shadow-soft">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{L("Profile completeness", "প্রোফাইল সম্পূর্ণতা")}</span>
            <span className="font-semibold">{completion}%</span>
          </div>
          <Progress value={completion} />
          <p className="mt-2 text-xs text-muted-foreground">
            {L(
              "A complete profile speeds up loan approval from our partner lenders.",
              "সম্পূর্ণ প্রোফাইল আমাদের পার্টনার ঋণদাতাদের কাছে লোন অনুমোদন দ্রুত করে।",
            )}
          </p>
        </CardContent>
      </Card>

      {kyc?.status === "rejected" && kyc?.reviewer_notes && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <p className="font-semibold">{L("KYC needs attention", "কেওয়াইসি সংশোধন প্রয়োজন")}</p>
            <p className="text-muted-foreground">{kyc.reviewer_notes}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="identity">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="identity" className="gap-1.5">
              <UserCircle className="h-4 w-4" /> {L("Identity", "পরিচয়")}
            </TabsTrigger>
            <TabsTrigger value="address" className="gap-1.5">
              <MapPin className="h-4 w-4" /> {L("Address", "ঠিকানা")}
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-1.5">
              <Briefcase className="h-4 w-4" /> {L("Income", "আয়")}
            </TabsTrigger>
            <TabsTrigger value="kyc" className="gap-1.5">
              <ShieldCheck className="h-4 w-4" /> {L("KYC", "কেওয়াইসি")}
            </TabsTrigger>
          </TabsList>

          {/* Identity */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{L("Personal Information", "ব্যক্তিগত তথ্য")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label={L("Full Name", "পূর্ণ নাম") + " *"}>
                  <Input value={form.full_name ?? ""} onChange={onInput("full_name")} maxLength={100} />
                </Field>
                <Field label={L("Mobile Number", "মোবাইল নম্বর") + " *"}>
                  <Input value={form.phone ?? ""} onChange={onInput("phone")} placeholder="+880 1XXXXXXXXX" />
                </Field>
                <Field label={L("Date of Birth", "জন্ম তারিখ")}>
                  <Input type="date" value={form.date_of_birth ?? ""} onChange={onInput("date_of_birth")} />
                </Field>
                <Field label={L("Gender", "লিঙ্গ")}>
                  <Select value={form.gender ?? ""} onValueChange={set("gender")}>
                    <SelectTrigger>
                      <SelectValue placeholder={L("Select", "নির্বাচন করুন")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{L("Male", "পুরুষ")}</SelectItem>
                      <SelectItem value="female">{L("Female", "মহিলা")}</SelectItem>
                      <SelectItem value="other">{L("Other", "অন্যান্য")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={L("Marital Status", "বৈবাহিক অবস্থা")}>
                  <Select value={form.marital_status ?? ""} onValueChange={set("marital_status")}>
                    <SelectTrigger>
                      <SelectValue placeholder={L("Select", "নির্বাচন করুন")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">{L("Single", "অবিবাহিত")}</SelectItem>
                      <SelectItem value="married">{L("Married", "বিবাহিত")}</SelectItem>
                      <SelectItem value="divorced">{L("Divorced", "তালাকপ্রাপ্ত")}</SelectItem>
                      <SelectItem value="widowed">{L("Widowed", "বিধবা/বিপত্নীক")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={L("Father's Name", "পিতার নাম")}>
                  <Input value={form.father_name ?? ""} onChange={onInput("father_name")} maxLength={100} />
                </Field>
                <Field label={L("Mother's Name", "মাতার নাম")}>
                  <Input value={form.mother_name ?? ""} onChange={onInput("mother_name")} maxLength={100} />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address */}
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{L("Address Details", "ঠিকানার বিবরণ")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label={L("Present Address", "বর্তমান ঠিকানা")}>
                    <Textarea value={form.address ?? ""} onChange={onInput("address")} rows={2} maxLength={300} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label={L("Permanent Address", "স্থায়ী ঠিকানা")}>
                    <Textarea
                      value={form.permanent_address ?? ""}
                      onChange={onInput("permanent_address")}
                      rows={2}
                      maxLength={300}
                    />
                  </Field>
                </div>
                <Field label={L("City / District", "শহর / জেলা")}>
                  <Input value={form.city ?? ""} onChange={onInput("city")} maxLength={80} />
                </Field>
                <Field label={L("Postal Code", "পোস্টাল কোড")}>
                  <Input value={form.postal_code ?? ""} onChange={onInput("postal_code")} maxLength={20} />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{L("Employment & Income", "পেশা ও আয়")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label={L("Employment Type", "পেশার ধরন")}>
                  <Select value={form.employment_type ?? ""} onValueChange={set("employment_type")}>
                    <SelectTrigger>
                      <SelectValue placeholder={L("Select", "নির্বাচন করুন")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salaried">{L("Salaried", "চাকরিজীবী")}</SelectItem>
                      <SelectItem value="business">{L("Business", "ব্যবসায়ী")}</SelectItem>
                      <SelectItem value="self_employed">{L("Self-employed", "স্ব-নিযুক্ত")}</SelectItem>
                      <SelectItem value="freelancer">{L("Freelancer", "ফ্রিল্যান্সার")}</SelectItem>
                      <SelectItem value="student">{L("Student", "শিক্ষার্থী")}</SelectItem>
                      <SelectItem value="other">{L("Other", "অন্যান্য")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={L("Occupation / Job Title", "পেশা / পদবি")}>
                  <Input value={form.occupation ?? ""} onChange={onInput("occupation")} maxLength={100} />
                </Field>
                <Field label={L("Employer / Business Name", "প্রতিষ্ঠান / ব্যবসার নাম")}>
                  <Input value={form.employer_name ?? ""} onChange={onInput("employer_name")} maxLength={120} />
                </Field>
                <Field label={L("Monthly Income (BDT)", "মাসিক আয় (টাকা)")}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={form.monthly_income ?? ""}
                    onChange={onInput("monthly_income")}
                    placeholder="25000"
                  />
                </Field>
                <Field label={L("Mobile Banking", "মোবাইল ব্যাংকিং")}>
                  <Select
                    value={form.mobile_banking_provider ?? ""}
                    onValueChange={set("mobile_banking_provider")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={L("Select", "নির্বাচন করুন")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="rocket">Rocket</SelectItem>
                      <SelectItem value="upay">Upay</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={L("Mobile Banking Number", "মোবাইল ব্যাংকিং নম্বর")}>
                  <Input
                    value={form.mobile_banking_number ?? ""}
                    onChange={onInput("mobile_banking_number")}
                    maxLength={20}
                  />
                </Field>
                <Field label={L("Emergency Contact Name", "জরুরি যোগাযোগের নাম")}>
                  <Input
                    value={form.emergency_contact_name ?? ""}
                    onChange={onInput("emergency_contact_name")}
                    maxLength={100}
                  />
                </Field>
                <Field label={L("Emergency Contact Phone", "জরুরি যোগাযোগের নম্বর")}>
                  <Input
                    value={form.emergency_contact_phone ?? ""}
                    onChange={onInput("emergency_contact_phone")}
                    maxLength={20}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={L("Loan Purpose (optional)", "লোনের উদ্দেশ্য (ঐচ্ছিক)")}>
                    <Textarea value={form.loan_purpose ?? ""} onChange={onInput("loan_purpose")} rows={2} maxLength={300} />
                  </Field>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC */}
          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  {L("Identity Verification (KYC)", "পরিচয় যাচাই (কেওয়াইসি)")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  {L(
                    "Upload clear photos of your National ID and a selfie. Your documents are encrypted and only visible to our verification team.",
                    "আপনার জাতীয় পরিচয়পত্র ও একটি সেলফির স্পষ্ট ছবি আপলোড করুন। ডকুমেন্ট এনক্রিপ্টেড এবং শুধু যাচাই দল দেখতে পারে।",
                  )}
                </p>

                <Field label={L("National ID / Birth Reg. Number", "জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর") + " *"}>
                  <Input value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} maxLength={40} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FileField
                    label={L("NID Front", "এনআইডি সামনের অংশ")}
                    existing={!!kyc?.nid_front_url}
                    onChange={(f) => setFiles((s) => ({ ...s, front: f }))}
                    L={L}
                  />
                  <FileField
                    label={L("NID Back", "এনআইডি পেছনের অংশ")}
                    existing={!!kyc?.nid_back_url}
                    onChange={(f) => setFiles((s) => ({ ...s, back: f }))}
                    L={L}
                  />
                  <FileField
                    label={L("Selfie", "সেলফি")}
                    existing={!!kyc?.selfie_url}
                    onChange={(f) => setFiles((s) => ({ ...s, selfie: f }))}
                    L={L}
                  />
                </div>

                <Button
                  variant="accent"
                  className="w-full"
                  onClick={handleKyc}
                  disabled={submittingKyc || kyc?.status === "approved"}
                >
                  {submittingKyc ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {kyc?.status === "approved"
                    ? L("Already verified", "ইতিমধ্যে যাচাইকৃত")
                    : kyc
                      ? L("Resubmit KYC", "পুনরায় কেওয়াইসি জমা দিন")
                      : L("Submit for Verification", "যাচাইয়ের জন্য জমা দিন")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <Button variant="hero" size="lg" onClick={handleSave} disabled={saving} className="shadow-elegant">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {L("Save Profile", "প্রোফাইল সংরক্ষণ")}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FileField({
  label,
  existing,
  onChange,
  L,
}: {
  label: string;
  existing: boolean;
  onChange: (f: File | undefined) => void;
  L: (en: string, bn: string) => string;
}) {
  const [name, setName] = useState<string>("");
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        <Upload className="h-3.5 w-3.5" /> {label}
        {existing && <CheckCircle2 className="h-3.5 w-3.5 text-accent" />}
      </Label>
      <Input
        type="file"
        accept="image/*"
        className="cursor-pointer text-xs"
        onChange={(e) => {
          const f = e.target.files?.[0];
          onChange(f);
          setName(f?.name ?? "");
        }}
      />
      <p className="truncate text-[11px] text-muted-foreground">
        {name || (existing ? L("Uploaded · choose to replace", "আপলোডকৃত · পরিবর্তনে নতুন দিন") : L("No file chosen", "কোনো ফাইল নেই"))}
      </p>
    </div>
  );
}
