import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, ShieldCheck, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";

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
  const { t } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    nid: "",
    dob: "",
    address: "",
    password: "",
    confirm: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    toast.info("Authentication backend not connected yet", {
      description: "Enable Lovable Cloud to activate registration, OTP & KYC.",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
          <UserPlus className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-3xl font-bold">{t("nav_signup")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Become a verified member of {t("brandFull")}
        </p>
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-accent" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.fullName} onChange={set("fullName")} maxLength={100} required />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input value={form.phone} onChange={set("phone")} placeholder="+880 1XXXXXXXXX" required />
              </div>
              <div className="space-y-2">
                <Label>Email (optional)</Label>
                <Input type="email" value={form.email} onChange={set("email")} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>National ID / Voter ID *</Label>
                <Input value={form.nid} onChange={set("nid")} required />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input type="date" value={form.dob} onChange={set("dob")} required />
              </div>
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <Input type="file" accept="image/*" className="cursor-pointer" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Textarea value={form.address} onChange={set("address")} rows={2} maxLength={300} required />
            </div>

            <div className="rounded-xl border border-dashed bg-muted/40 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Upload className="h-4 w-4 text-primary" /> KYC Documents
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {["NID Front", "NID Back", "Selfie"].map((d) => (
                  <div key={d} className="space-y-1.5">
                    <Label className="text-xs">{d}</Label>
                    <Input type="file" accept="image/*" className="cursor-pointer text-xs" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={set("password")} required />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password *</Label>
                <Input type="password" value={form.confirm} onChange={set("confirm")} required />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full">
              Create Account
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {t("nav_login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
