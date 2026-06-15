import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  User,
  Phone,
  Lock,
  Briefcase,
  ChevronDown,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";
import { useBranding } from "@/context/branding";
import { supabase } from "@/integrations/supabase/client";

const PROFESSIONS = [
  { value: "salaried", label: { en: "Salaried Employee", bn: "চাকরিজীবী" } },
  { value: "business", label: { en: "Business Owner", bn: "ব্যবসায়ী" } },
  { value: "self-employed", label: { en: "Self-employed", bn: "স্বনির্ভরশীল" } },
  { value: "freelancer", label: { en: "Freelancer", bn: "ফ্রিল্যান্সার" } },
  { value: "farmer", label: { en: "Farmer", bn: "কৃষক" } },
  { value: "student", label: { en: "Student", bn: "ছাত্র" } },
  { value: "homemaker", label: { en: "Homemaker", bn: "গৃহিণী" } },
  { value: "other", label: { en: "Other", bn: "অন্যান্য" } },
];

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Get Started | Smart Loan" },
      { name: "description", content: "Create your Smart Loan membership account." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const { t, lang } = useLanguage();
  const { logoUrl, brandName } = useBranding();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [professionOpen, setProfessionOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    profession: "",
    password: "",
    confirm: "",
  });

  const selectedProfession = PROFESSIONS.find((p) => p.value === form.profession);

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
    if (!form.profession) {
      toast.error(L("Please select a profession", "অনুগ্রহ করে পেশা নির্বাচন করুন"));
      return;
    }
    setLoading(true);
    // Use phone as email since we removed email field
    const email = `${form.phone.replace(/\D/g, "")}@smartloan.local`;
    const { error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone,
          occupation: form.profession,
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
        "Next, complete your KYC verification to apply for a loan.",
        "এরপর, ঋণের জন্য আবেদন করতে আপনার কেওয়াইসি যাচাই সম্পন্ন করুন।",
      ),
    });
    navigate({ to: "/profile" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card className="relative overflow-visible rounded-3xl border-0 bg-white shadow-elegant">
        {/* Logo badge */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName ?? "Logo"}
              className="h-20 w-20 rounded-full object-contain shadow-soft bg-white"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-soft">
              <ShieldCheck className="h-10 w-10" />
            </div>
          )}
        </div>

        <CardContent className="pt-14 pb-8 px-8">
          <form onSubmit={submit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {L("Full Name", "পুরো নাম")}
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <Input
                  className="h-12 rounded-xl border border-input pl-12 text-base shadow-none focus-visible:ring-primary"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder={L("Enter your name", "আপনার নাম লিখুন")}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {L("Mobile Number (11 digits)", "মোবাইল নাম্বার (১১ ডিজিট)")}
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <Input
                  className="h-12 rounded-xl border border-input pl-12 text-base shadow-none focus-visible:ring-primary"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={L("Enter your number", "আপনার নাম্বার লিখুন")}
                  inputMode="numeric"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            {/* Profession Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {L("Profession", "পেশা")}
              </Label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <button
                  type="button"
                  onClick={() => setProfessionOpen((o) => !o)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-white pl-12 pr-4 text-base text-left focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className={selectedProfession ? "text-foreground" : "text-muted-foreground"}>
                    {selectedProfession
                      ? L(selectedProfession.label.en, selectedProfession.label.bn)
                      : L("Select profession", "পেশা নির্বাচন করুন")}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {professionOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-input bg-white py-1 shadow-lg">
                    {PROFESSIONS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, profession: p.value });
                          setProfessionOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted"
                      >
                        {L(p.label.en, p.label.bn)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {L("Password", "পাসওয়ার্ড")}
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={L("Enter password", "পাসওয়ার্ড লিখুন")}
                  className="h-12 rounded-xl border border-input pl-12 pr-16 text-base shadow-none focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary hover:text-accent"
                >
                  {showPassword ? L("Hide", "লুকান") : L("Show", "দেখুন")}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {L("Confirm Password", "পাসওয়ার্ড নিশ্চিত করুন")}
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder={L("Re-enter password", "পাসওয়ার্ড আবার লিখুন")}
                  className="h-12 rounded-xl border border-input pl-12 pr-16 text-base shadow-none focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary hover:text-accent"
                >
                  {showConfirm ? L("Hide", "লুকান") : L("Show", "দেখুন")}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl gradient-primary text-base font-semibold text-primary-foreground shadow-soft hover:opacity-90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <UserPlus className="mr-2 h-5 w-5" />
              {L("Register", "নিবন্ধন করুন")}
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

