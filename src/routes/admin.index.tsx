import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Users, FileCheck2, Banknote, ShieldAlert, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/admin.functions";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchOverview(),
  });

  const stats = [
    { label: "Total Members", value: data?.members ?? 0, icon: Users, tone: "text-primary" },
    { label: "Pending KYC", value: data?.pendingKyc ?? 0, icon: FileCheck2, tone: "text-amber-500" },
    { label: "Pending Loans", value: data?.pendingLoans ?? 0, icon: Banknote, tone: "text-sky-500" },
    { label: "Open Fraud Flags", value: data?.openFraud ?? 0, icon: ShieldAlert, tone: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-soft">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : s.value}
                </p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-muted ${s.tone}`}>
                <s.icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Recent admin activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (data?.recentLogs?.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y">
              {data!.recentLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground"> · {log.entity_type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
