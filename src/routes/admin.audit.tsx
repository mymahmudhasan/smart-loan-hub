import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuditLogs } from "@/lib/admin.functions";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAudit,
});

type Log = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

function AdminAudit() {
  const fetchLogs = useServerFn(listAuditLogs);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => fetchLogs() as unknown as Promise<Log[]>,
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
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No audit entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data ?? []).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium capitalize">{log.action.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-sm">{log.entity_type}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {JSON.stringify(log.details)}
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
