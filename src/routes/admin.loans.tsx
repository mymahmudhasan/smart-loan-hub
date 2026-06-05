import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listLoans, reviewLoan } from "@/lib/admin.functions";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/admin/loans")({
  component: AdminLoans,
});

type Loan = {
  id: string;
  amount: number;
  months: number;
  purpose: string | null;
  emi: number | null;
  status: string;
  reviewer_notes: string | null;
  profiles: { full_name: string | null; phone: string | null; email: string | null; member_balance: number } | null;
};

function AdminLoans() {
  const fetchLoans = useServerFn(listLoans);
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "loans"],
    queryFn: () => fetchLoans() as unknown as Promise<Loan[]>,
  });

  const rows = (data ?? []).filter((l) => filter === "all" || l.status === filter);

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4 sm:p-6">
        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No applications.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{l.profiles?.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          Balance: {formatBDT(l.profiles?.member_balance ?? 0)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatBDT(l.amount)}</TableCell>
                      <TableCell className="text-sm">{l.months} mo</TableCell>
                      <TableCell className="text-sm">{l.emi ? formatBDT(l.emi) : "—"}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-right">
                        <ReviewLoan loan={l} onDone={() => qc.invalidateQueries({ queryKey: ["admin", "loans"] })} />
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

function ReviewLoan({ loan, onDone }: { loan: Loan; onDone: () => void }) {
  const review = useServerFn(reviewLoan);
  const [notes, setNotes] = useState("");
  const [show, setShow] = useState(false);
  const mut = useMutation({
    mutationFn: (status: "approved" | "rejected") => review({ data: { id: loan.id, status, notes } }),
    onSuccess: (_d, status) => {
      toast.success(`Loan ${status}`);
      onDone();
    },
    onError: (e) => toast.error("Failed", { description: (e as Error).message }),
  });

  if (loan.status !== "pending") {
    return <span className="text-xs text-muted-foreground">{loan.reviewer_notes || "Reviewed"}</span>;
  }
  if (!show) {
    return <Button variant="outline" size="sm" onClick={() => setShow(true)}>Review</Button>;
  }
  return (
    <div className="flex flex-col items-end gap-2">
      <Textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-56 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="accent" disabled={mut.isPending} onClick={() => mut.mutate("approved")}>
          <Check className="h-4 w-4" /> Approve
        </Button>
        <Button size="sm" variant="destructive" disabled={mut.isPending} onClick={() => mut.mutate("rejected")}>
          <X className="h-4 w-4" /> Reject
        </Button>
      </div>
    </div>
  );
}
