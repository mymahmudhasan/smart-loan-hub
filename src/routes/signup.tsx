import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  User,
  Phone,
  Mail,
  Lock,
  Gift,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Get Started | Smart Loan" },
      { name: "description", content: "Create your Smart Loan membership account and complete KYC verification." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    referral: "",
  });

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setForm((f) => ({ ...f, referral: ref.trim().toUpperCase() }));
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error(L("Passwords do not match", "পাসওয়ার্ড মিলছে না"));
      return;
    }
    if (form.password.length < 6) {
      toast.error(L("Password must be at least 6 characters", "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: {
          full_name: form.fullName,
          phone: form.phone,
          referred_by: form.referral.trim().toUpperCase(),
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(L("Registration failed", "নিবন্ধন ব্যর্থ হয়েছে"), { description: error.message });
      return;
    }
    toast.success(L("Account created!", "অ্যাকাউন্ট তৈরি হয়েছে!"), {
      description: L(
        "Next, complete your profile & KYC verification to apply for a loan.",
        "এরপর, ঋণের জন্য আবেদন করতে আপনার প্রোফাইল ও কেওয়াইসি যাচাই সম্পন্ন করুন।",
      ),
    });
    navigate({ to: "/profile" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <UserPlus className="h-7 w-7" />
        </span>
        <h1 className="mt-3 text-3xl font-bold">{t("nav_signup")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {L(`Become a verified member of ${t("brandFull")}`, `${t("brandFull")}-এর যাচাইকৃত সদস্য হন`)}
        </p>
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-accent" />
            {L("Create Your Account", "আপনার অ্যাকাউন্ট তৈরি করুন")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>{L("Full Name", "পুরো নাম")} *</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  className="pl-10"
                  value={form.fullName}
                  onChange={set("fullName")}
                  placeholder={L("Enter your name", "আপনার নাম লিখুন")}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{L("Mobile Number (11 digits)", "মোবাইল নাম্বার (১১ ডিজিট)")} *</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  className="pl-10"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder={L("Enter your number", "আপনার নাম্বার লিখুন")}
                  inputMode="numeric"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{L("Email", "ইমেইল")} *</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  type="email"
                  className="pl-10"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  maxLength={255}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{L("Password", "পাসওয়ার্ড")} *</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder={L("Enter password", "পাসওয়ার্ড লিখুন")}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{L("Confirm Password", "পাসওয়ার্ড নিশ্চিত করুন")} *</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder={L("Re-enter password", "পাসওয়ার্ড আবার লিখুন")}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-accent" /> {t("signup_referral")}
              </Label>
              <Input
                value={form.referral}
                onChange={(e) => setForm({ ...form, referral: e.target.value.toUpperCase() })}
                maxLength={20}
                placeholder="ABCD1234"
              />
            </div>

            <div className="rounded-xl border border-dashed bg-muted/40 p-3 text-center text-xs text-muted-foreground">
              {L(
                "After creating your account, complete your profile details (NID, profession, income) & KYC verification to apply for a loan.",
                "অ্যাকাউন্ট তৈরির পর, ঋণের জন্য আবেদন করতে আপনার প্রোফাইলের তথ্য (এনআইডি, পেশা, আয়) ও কেওয়াইসি যাচাই সম্পন্ন করুন।",
              )}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <UserPlus className="h-4 w-4" />
              {L("Create Account", "অ্যাকাউন্ট তৈরি করুন")}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {L("Already a member?", "ইতিমধ্যে সদস্য?")}{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {t("nav_login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
