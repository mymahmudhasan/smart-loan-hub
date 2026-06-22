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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listKyc, reviewKyc, getKycDocuments } from "@/lib/admin.functions";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/kyc")({
  component: AdminKyc,
});

type Kyc = {
  id: string;
  user_id: string;
  nid_number: string | null;
  status: string;
  reviewer_notes: string | null;
  created_at: string;
  profiles: { full_name: string | null; phone: string | null; email: string | null } | null;
};

function AdminKyc() {
  const fetchKyc = useServerFn(listKyc);
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "kyc"],
    queryFn: () => fetchKyc() as unknown as Promise<Kyc[]>,
  });

  const rows = (data ?? []).filter((k) => filter === "all" || k.status === filter);

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
                  <TableHead>NID</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No submissions.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell>
                        <Link
                          to="/admin/member/$userId"
                          params={{ userId: k.user_id }}
                          className="font-medium text-primary hover:underline"
                        >
                          {k.profiles?.full_name || "—"}
                        </Link>
                        <div className="text-xs text-muted-foreground">{k.profiles?.phone || k.profiles?.email || "—"}</div>
                      </TableCell>
                      <TableCell className="text-sm">{k.nid_number || "—"}</TableCell>
                      <TableCell>
                        <ViewDocuments kyc={k} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(k.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell><StatusBadge status={k.status} /></TableCell>
                      <TableCell className="text-right">
                        <ReviewKyc kyc={k} onDone={() => qc.invalidateQueries({ queryKey: ["admin", "kyc"] })} />
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

function ReviewKyc({ kyc, onDone }: { kyc: Kyc; onDone: () => void }) {
  const review = useServerFn(reviewKyc);
  const [notes, setNotes] = useState("");
  const [show, setShow] = useState(false);
  const mut = useMutation({
    mutationFn: (status: "approved" | "rejected") => review({ data: { id: kyc.id, status, notes } }),
    onSuccess: (_d, status) => {
      toast.success(`KYC ${status}`);
      onDone();
    },
    onError: (e) => toast.error("Failed", { description: (e as Error).message }),
  });

  if (kyc.status !== "pending") {
    return <span className="text-xs text-muted-foreground">{kyc.reviewer_notes || "Reviewed"}</span>;
  }

  if (!show) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShow(true)}>Review</Button>
    );
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
