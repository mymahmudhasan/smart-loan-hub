import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyMyPayment } from "@/lib/payment.functions";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/payment-status")({
  head: () => ({
    meta: [{ title: "Payment Status | Smart Loan" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    pp_id: typeof search.pp_id === "string" ? search.pp_id : undefined,
  }),
  component: PaymentStatus,
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-muted-foreground">Could not load payment status.</p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/payments">Back to Payments</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => null,
});

function PaymentStatus() {
  const { pp_id } = Route.useSearch();
  const verify = useServerFn(verifyMyPayment);
  const router = useRouter();

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
              <h1 className="text-xl font-bold">No payment reference</h1>
              <p className="text-sm text-muted-foreground">
                We couldn't find a payment to verify.
              </p>
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h1 className="text-xl font-bold">Verifying your payment…</h1>
              <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </>
          ) : isError ? (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-bold">Verification failed</h1>
              <p className="text-sm text-muted-foreground">
                We couldn't confirm your payment. If money was deducted, it will be
                reconciled automatically.
              </p>
            </>
          ) : data?.paid ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-accent" />
              <h1 className="text-xl font-bold">Payment successful</h1>
              <p className="text-sm text-muted-foreground">
                {data.amount ? `${formatBDT(Number(data.amount))} received. ` : ""}
                Your transaction is now complete.
              </p>
            </>
          ) : (
            <>
              <Clock className="h-12 w-12 text-warning" />
              <h1 className="text-xl font-bold">Payment {data?.status ?? "pending"}</h1>
              <p className="text-sm text-muted-foreground">
                Your payment hasn't been confirmed yet. It may take a few minutes.
              </p>
              <Button variant="outline" onClick={() => router.invalidate()}>
                Check again
              </Button>
            </>
          )}

          <div className="mt-2 flex gap-3">
            <Button asChild variant="hero">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/payments">Payments</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
