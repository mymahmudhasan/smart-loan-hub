import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { getMyAccount } from "@/lib/member.functions";
import { formatBDT } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-loans")({
  head: () => ({
    meta: [
      { title: "আমার লোন | Smart Loan" },
      { name: "description", content: "আপনার সব লোন আবেদনের অবস্থা ও বিস্তারিত এক জায়গায় দেখুন।" },
    ],
  }),
  component: MyLoans,
});

type LoanRow = {
  id: string;
  amount: number;
  months: number;
  purpose: string | null;
  emi: number | null;
  status: string;
  created_at: string;
};

function statusClasses(status: string) {
  switch (status) {
    case "approved":
      return "text-accent border-accent/30 bg-accent/10";
    case "rejected":
      return "text-destructive border-destructive/30 bg-destructive/10";
    default:
      return "text-warning border-warning/30 bg-warning/10";
  }
}

function MyLoans() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const fetchAccount = useServerFn(getMyAccount);

  const { data, isLoading } = useQuery({
    queryKey: ["my-account", "loans"],
    queryFn: () => fetchAccount(),
    enabled: !!user,
  });

  const loans = (data?.loans ?? []) as LoanRow[];

  return (
    <div className="mx-auto max-w-md px-4 py-8 pb-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold">{t("qa_myloans")}</h1>
          <p className="text-sm text-muted-foreground">
            {loans.length} {L(loans.length === 1 ? "application" : "applications", "টি আবেদন")}
          </p>
        </div>
      </div>

      {!user ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            {L("Please sign in to view your loans.", "আপনার লোন দেখতে অনুগ্রহ করে সাইন ইন করুন।")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">{L("Loading…", "লোড হচ্ছে…")}</CardContent>
        </Card>
      ) : loans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">{L("You have no loan applications yet.", "আপনার এখনো কোনো লোন আবেদন নেই।")}</p>
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              {t("dash_apply_cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {loans.map((l) => (
            <Card key={l.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold leading-tight">{formatBDT(l.amount)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.purpose || "—"} · {l.months} {L("mo", "মাস")}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 capitalize", statusClasses(l.status))}>
                    {l.status === "approved"
                      ? L("Approved", "অনুমোদিত")
                      : l.status === "rejected"
                        ? L("Rejected", "প্রত্যাখ্যাত")
                        : L("Pending", "অপেক্ষমাণ")}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span>EMI: {l.emi ? formatBDT(l.emi) : "—"}</span>
                  <span>{new Date(l.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
