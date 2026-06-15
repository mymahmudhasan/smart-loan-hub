import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listFraudFlags, resolveFraudFlag } from "@/lib/admin.functions";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/fraud")({
  component: AdminFraud,
});

type Flag = {
  id: string;
  user_id: string;
  reason: string;
  severity: string;
  status: string;
  created_at: string;
  profiles: { full_name: string | null; phone: string | null; email: string | null } | null;
};

function AdminFraud() {
  const fetchFlags = useServerFn(listFraudFlags);
  const resolve = useServerFn(resolveFraudFlag);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "fraud"],
    queryFn: () => fetchFlags() as unknown as Promise<Flag[]>,
  });

  const mut = useMutation({
    mutationFn: (vars: { id: string; status: "resolved" | "dismissed" }) =>
      resolve({ data: vars }),
    onSuccess: () => {
      toast.success("Flag updated");
      qc.invalidateQueries({ queryKey: ["admin", "fraud"] });
    },
    onError: (e) => toast.error("Failed", { description: (e as Error).message }),
  });

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No fraud flags.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data ?? []).map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Link
                          to="/admin/member/$userId"
                          params={{ userId: f.user_id }}
                          className="font-medium text-primary hover:underline"
                        >
                          {f.profiles?.full_name || "—"}
                        </Link>
                        <div className="text-xs text-muted-foreground">{f.profiles?.phone || f.profiles?.email || "—"}</div>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm">{f.reason}</TableCell>
                      <TableCell><StatusBadge status={f.severity} /></TableCell>
                      <TableCell><StatusBadge status={f.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        {f.status === "open" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="accent" disabled={mut.isPending} onClick={() => mut.mutate({ id: f.id, status: "resolved" })}>
                              Resolve
                            </Button>
                            <Button size="sm" variant="outline" disabled={mut.isPending} onClick={() => mut.mutate({ id: f.id, status: "dismissed" })}>
                              Dismiss
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Closed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
