import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyMyPayment } from "@/lib/payment.functions";
import { formatBDT } from "@/lib/format";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/payment-status")({
  head: () => ({
    meta: [{ title: "Payment Status | Smart Loan" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    pp_id: typeof search.pp_id === "string" ? search.pp_id : undefined,
  }),
  component: PaymentStatus,
  errorComponent: ErrorView,
  notFoundComponent: () => null,
});

function ErrorView() {
  const { lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-muted-foreground">{L("Could not load payment status.", "পেমেন্ট স্ট্যাটাস লোড করা যায়নি।")}</p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/payments">{L("Back to Payments", "পেমেন্টে ফিরে যান")}</Link>
      </Button>
    </div>
  );
}

function PaymentStatus() {
  const { pp_id } = Route.useSearch();
  const verify = useServerFn(verifyMyPayment);
  const router = useRouter();
  const { lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-payment", pp_id],
    queryFn: () => verify({ data: { ppId: pp_id! } }),
    enabled: !!pp_id,
    retry: 2,
  });

  return (
    <div className="mx-auto max-w-md px-4 py-16 lg:py-24">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {!pp_id ? (
            <>
              <Clock className="h-12 w-12 text-warning" />
              <h1 className="text-xl font-bold">{L("No payment reference", "কোনো পেমেন্ট রেফারেন্স নেই")}</h1>
              <p className="text-sm text-muted-foreground">
                {L("We couldn't find a payment to verify.", "যাচাই করার মতো কোনো পেমেন্ট পাওয়া যায়নি।")}
              </p>
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h1 className="text-xl font-bold">{L("Verifying your payment…", "আপনার পেমেন্ট যাচাই করা হচ্ছে…")}</h1>
              <p className="text-sm text-muted-foreground">{L("Please wait a moment.", "অনুগ্রহ করে একটু অপেক্ষা করুন।")}</p>
            </>
          ) : isError ? (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-bold">{L("Verification failed", "যাচাইকরণ ব্যর্থ হয়েছে")}</h1>
              <p className="text-sm text-muted-foreground">
                {L(
                  "We couldn't confirm your payment. If money was deducted, it will be reconciled automatically.",
                  "আমরা আপনার পেমেন্ট নিশ্চিত করতে পারিনি। যদি টাকা কাটা হয়ে থাকে, তা স্বয়ংক্রিয়ভাবে সমন্বয় করা হবে।",
                )}
              </p>
            </>
          ) : data?.paid ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-accent" />
              <h1 className="text-xl font-bold">{L("Payment successful", "পেমেন্ট সফল হয়েছে")}</h1>
              <p className="text-sm text-muted-foreground">
                {data.amount ? `${formatBDT(Number(data.amount))} ${L("received.", "গৃহীত হয়েছে।")} ` : ""}
                {L("Your transaction is now complete.", "আপনার লেনদেন এখন সম্পন্ন হয়েছে।")}
              </p>
            </>
          ) : (
            <>
              <Clock className="h-12 w-12 text-warning" />
              <h1 className="text-xl font-bold">{L("Payment", "পেমেন্ট")} {data?.status ?? L("pending", "অপেক্ষমাণ")}</h1>
              <p className="text-sm text-muted-foreground">
                {L(
                  "Your payment hasn't been confirmed yet. It may take a few minutes.",
                  "আপনার পেমেন্ট এখনো নিশ্চিত হয়নি। এতে কয়েক মিনিট সময় লাগতে পারে।",
                )}
              </p>
              <Button variant="outline" onClick={() => router.invalidate()}>
                {L("Check again", "আবার দেখুন")}
              </Button>
            </>
          )}

          <div className="mt-2 flex gap-3">
            <Button asChild variant="hero">
              <Link to="/dashboard">{L("Go to Dashboard", "ড্যাশবোর্ডে যান")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/payments">{L("Payments", "পেমেন্ট")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
