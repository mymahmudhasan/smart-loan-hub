import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, X, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listLoans, reviewLoan } from "@/lib/admin.functions";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/admin/loans")({
  component: AdminLoans,
});

type Loan = {
  id: string;
  user_id: string;
  amount: number;
  months: number;
  purpose: string | null;
  emi: number | null;
  status: string;
  reviewer_notes: string | null;
  created_at?: string | null;
  reviewed_at?: string | null;
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
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "loans"] });

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
                  <TableHead className="text-right">Details</TableHead>
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
                        <Link
                          to="/admin/member/$userId"
                          params={{ userId: l.user_id }}
                          className="font-medium text-primary hover:underline"
                        >
                          {l.profiles?.full_name || "—"}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          Balance: {formatBDT(l.profiles?.member_balance ?? 0)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatBDT(l.amount)}</TableCell>
                      <TableCell className="text-sm">{l.months} mo</TableCell>
                      <TableCell className="text-sm">{l.emi ? formatBDT(l.emi) : "—"}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell className="text-right">
                        <LoanDetails loan={l} onDone={invalidate} />
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function LoanDetails({ loan, onDone }: { loan: Loan; onDone: () => void }) {
  const review = useServerFn(reviewLoan);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const mut = useMutation({
    mutationFn: (status: "approved" | "rejected") => review({ data: { id: loan.id, status, notes } }),
    onSuccess: (_d, status) => {
      toast.success(`Loan ${status}`);
      setOpen(false);
      onDone();
    },
    onError: (e) => toast.error("Failed", { description: (e as Error).message }),
  });

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" /> View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Loan application</DialogTitle>
          <DialogDescription>Review the full details and decide.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <DetailRow
            label="Applicant"
            value={
              <Link
                to="/admin/member/$userId"
                params={{ userId: loan.user_id }}
                className="text-primary hover:underline"
              >
                {loan.profiles?.full_name || "—"}
              </Link>
            }
          />
          <DetailRow label="Phone" value={loan.profiles?.phone || "—"} />
          <DetailRow label="Email" value={loan.profiles?.email || "—"} />
          <DetailRow label="Member balance" value={formatBDT(loan.profiles?.member_balance ?? 0)} />
          <DetailRow label="Amount" value={formatBDT(loan.amount)} />
          <DetailRow label="Term" value={`${loan.months} months`} />
          <DetailRow label="EMI" value={loan.emi ? formatBDT(loan.emi) : "—"} />
          <DetailRow label="Purpose" value={loan.purpose || "—"} />
          <DetailRow label="Status" value={<StatusBadge status={loan.status} />} />
          <DetailRow label="Applied" value={fmtDate(loan.created_at)} />
          {loan.status !== "pending" && (
            <>
              <DetailRow label="Reviewed" value={fmtDate(loan.reviewed_at)} />
              <DetailRow label="Reviewer notes" value={loan.reviewer_notes || "—"} />
            </>
          )}
        </div>

        {loan.status === "pending" ? (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="accent"
                disabled={mut.isPending}
                onClick={() => mut.mutate("approved")}
              >
                {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
              </Button>
              <Button
                variant="destructive"
                disabled={mut.isPending}
                onClick={() => mut.mutate("rejected")}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            This application has already been {loan.status}.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
