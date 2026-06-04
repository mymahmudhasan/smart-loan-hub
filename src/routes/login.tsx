import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In | Smart Loan" },
      { name: "description", content: "Securely log in to your Smart Loan membership account." },
    ],
  }),
  component: Login,
});

function Login() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ phone: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Authentication backend not connected yet", {
      description: "Enable Lovable Cloud to activate secure login & sessions.",
    });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <CardTitle className="mt-3 text-2xl">{t("nav_login")}</CardTitle>
          <p className="text-sm text-muted-foreground">Welcome back to {t("brandFull")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input
                placeholder="+880 1XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <Link to="/login" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              <LogIn className="h-4 w-4" /> {t("nav_login")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              {t("nav_signup")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
