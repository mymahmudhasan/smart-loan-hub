import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, ShieldCheck, FileText, Wallet, BadgeCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { getMyApprovalStatus } from "@/lib/member.functions";

type StageState = "done" | "active" | "todo";

function useCountdown(deadlineISO: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadlineISO) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadlineISO]);

  if (!deadlineISO) return { ms: 0, expired: true };
  const ms = new Date(deadlineISO).getTime() - now;
  return { ms: Math.max(0, ms), expired: ms <= 0 };
}

export function ApprovalTimeline() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const fetchStatus = useServerFn(getMyApprovalStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["approval-status", user?.id],
    queryFn: () => fetchStatus(),
    enabled: !!user && !loading,
    refetchInterval: 60_000,
  });

  const { ms, expired } = useCountdown(data?.approvalDeadline ?? null);

  const stages = useMemo(() => {
    if (!data) return [];
    const verified = data.memberStatus === "verified";
    const hasDeposit = !!data.approvalStartedAt || !!data.latestDeposit;
    const kycApproved = data.kycStatus === "approved";
    const docsRequested = !!data.documentsRequested;

    const list: { key: string; label: string; icon: typeof Wallet; state: StageState }[] = [
      {
        key: "deposit",
        label: t("appr_stage_deposit"),
        icon: Wallet,
        state: hasDeposit ? "done" : "active",
      },
      {
        key: "kyc",
        label: t("appr_stage_kyc"),
        icon: ShieldCheck,
        state: kycApproved ? "done" : hasDeposit ? "active" : "todo",
      },
      {
        key: "docs",
        label: t("appr_stage_docs"),
        icon: FileText,
        state: verified ? "done" : docsRequested ? "active" : kycApproved ? "active" : "todo",
      },
      {
        key: "active",
        label: t("appr_stage_active"),
        icon: BadgeCheck,
        state: verified ? "done" : "todo",
      },
    ];
    return list;
  }, [data, t]);

  if (!user || isLoading || !data) return null;

  // Approved — celebratory state
  if (data.memberStatus === "verified") {
    return (
      <Card className="mb-6 border-accent/40 bg-accent/5">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="font-semibold">{t("appr_approved_title")}</p>
            <p className="text-sm text-muted-foreground">{t("appr_approved_desc")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const started = !!data.approvalStartedAt;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);

  const totalMs = data.windowHours * 3_600_000;
  const elapsedPct = started ? Math.min(100, Math.max(0, ((totalMs - ms) / totalMs) * 100)) : 0;

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" /> {t("appr_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("appr_subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!started ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{t("appr_start_hint")}</p>
            <Button variant="hero" size="sm" asChild>
              <Link to="/payments">
                <Wallet className="h-4 w-4" /> {t("appr_make_deposit")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl gradient-primary p-5 text-on-hero shadow-elegant">
            <p className="text-xs uppercase tracking-wider text-on-hero/80">{t("appr_timeleft")}</p>
            {expired ? (
              <p className="mt-2 flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("appr_deadline_passed")}
              </p>
            ) : (
              <div className="mt-2 flex items-end gap-3 font-mono">
                {[
                  { v: d, u: t("appr_days") },
                  { v: h, u: t("appr_hours") },
                  { v: m, u: t("appr_mins") },
                  { v: s, u: t("appr_secs") },
                ].map((seg) => (
                  <div key={seg.u} className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-bold tabular-nums sm:text-4xl">
                      {String(seg.v).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-on-hero/70">{seg.u}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-500"
                style={{ width: `${elapsedPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Document request banner */}
        {data.documentsRequested && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-semibold">{t("appr_docs_needed")}</p>
              <p className="text-muted-foreground">{data.documentsRequested}</p>
            </div>
          </div>
        )}

        {/* Stages */}
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((st, i) => (
            <li
              key={st.key}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3",
                st.state === "done" && "border-accent/40 bg-accent/5",
                st.state === "active" && "border-primary/40 bg-primary/5",
                st.state === "todo" && "border-border bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  st.state === "done" && "bg-accent/15 text-accent",
                  st.state === "active" && "bg-primary/15 text-primary",
                  st.state === "todo" && "bg-muted text-muted-foreground",
                )}
              >
                {st.state === "done" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <st.icon className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="truncate text-sm font-semibold">{st.label}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
