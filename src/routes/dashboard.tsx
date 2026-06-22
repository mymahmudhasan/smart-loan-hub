import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldPlus,
  ShieldMinus,
  Wallet,
  UserRound,
  ClipboardList,
  RefreshCw,
  MessageCircle,
  Info,
  ArrowRight,
  Users,
  Coins,
  Copy,
  Check,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { getMyProfile } from "@/lib/profile.functions";
import { getMyReferral } from "@/lib/referral.functions";
import { formatBDT } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড | Smart Loan" },
      {
        name: "description",
        content:
          "আপনার লোন, ব্যালেন্স ও দ্রুত অ্যাকশন এক জায়গায়। NID ও মোবাইল নাম্বার দিয়ে সহজে লোন আবেদন করুন।",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Member";

  const fetchProfile = useServerFn(getMyProfile);
  const { data: profileData, isLoading: balanceLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });
  const balance = Number(profileData?.profile?.member_balance ?? 0);

  const fetchReferral = useServerFn(getMyReferral);
  const { data: referralData, isLoading: referralLoading } = useQuery({
    queryKey: ["my-referral"],
    queryFn: () => fetchReferral(),
    enabled: !!user,
  });

  const [copied, setCopied] = useState(false);
  const referralLink = referralData?.code
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(referralData.code)}`
    : "";

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    { key: "qa_loan_apply", icon: ShieldPlus, to: "/apply", tint: "text-primary bg-primary/10" },
    { key: "qa_cashout", icon: ShieldMinus, to: "/payments", tint: "text-destructive bg-destructive/10" },
    { key: "qa_deposit", icon: Wallet, to: "/payments", tint: "text-accent bg-accent/10" },
    { key: "qa_profile", icon: UserRound, to: "/profile", tint: "text-warning bg-warning/15" },
    { key: "qa_myloans", icon: ClipboardList, to: "/my-loans", tint: "text-primary bg-primary/10" },
    { key: "qa_update", icon: RefreshCw, to: "/profile", tint: "text-accent bg-accent/10" },
    { key: "qa_contact", icon: MessageCircle, to: "/contact", tint: "text-success bg-success/15" },
    { key: "qa_about", icon: Info, to: "/membership", tint: "text-warning bg-warning/15" },
  ] as const;

  return (
    <div className="mx-auto max-w-md pb-12">
      {/* Gradient header */}
      <section className="gradient-hero text-on-hero">
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/15 text-lg font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="text-lg font-bold tracking-tight">{displayName}</span>
            </div>

            <Link
              to="/payments"
              className="flex flex-col items-end rounded-xl bg-card px-4 py-2 text-right shadow-soft transition-transform hover:scale-[1.02]"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                {t("dash_balance_label")}
              </span>
              <span className="text-lg font-extrabold leading-tight text-foreground">
                {balanceLoading ? "…" : formatBDT(balance)}
              </span>
            </Link>
          </div>
        </div>

        <div className="px-5 pb-10 pt-8 text-center [text-shadow:_0_1px_10px_rgb(0_0_0_/_45%)]">
          <h1 className="text-xl font-bold leading-snug sm:text-2xl">
            {t("dash_hub_title")}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-on-hero/90">
            {t("dash_hub_sub")}
          </p>
          <Link
            to="/apply"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-card px-6 py-3 text-sm font-bold text-primary shadow-elegant transition-transform hover:scale-[1.02] [text-shadow:none]"
          >
            {t("dash_apply_cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Quick actions grid */}
      <section className="px-4 py-8">
        <div className="grid grid-cols-4 gap-x-2 gap-y-7">
          {actions.map((a) => (
            <Link
              key={a.key + a.to}
              to={a.to}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-soft transition-transform hover:scale-105 ${a.tint}`}
              >
                <a.icon className="h-6 w-6" />
              </span>
              <span className="text-xs font-medium leading-tight text-foreground">
                {t(a.key)}
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
