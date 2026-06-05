import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listMembers, setMemberStatus, setMemberBalance } from "@/lib/admin.functions";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/admin/members")({
  component: AdminMembers,
});

type Member = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  nid_number: string | null;
  member_balance: number;
  member_status: string;
  roles: string[];
};

function AdminMembers() {
  const fetchMembers = useServerFn(listMembers);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: () => fetchMembers() as Promise<Member[]>,
  });

  const filtered = (data ?? []).filter((m) => {
    const q = search.toLowerCase();
    return (
      !q ||
      m.full_name?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.nid_number?.toLowerCase().includes(q)
    );
  });

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
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
                  <TableHead>Contact</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">{m.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">NID: {m.nid_number || "—"}</div>
                        {m.roles.includes("admin") && (
                          <span className="text-xs font-semibold text-primary">Admin</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{m.phone || "—"}</div>
                        <div className="text-xs text-muted-foreground">{m.email || "—"}</div>
                      </TableCell>
                      <TableCell className="font-medium">{formatBDT(m.member_balance)}</TableCell>
                      <TableCell>
                        <StatusBadge status={m.member_status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <ManageMemberDialog member={m} onDone={() => qc.invalidateQueries({ queryKey: ["admin", "members"] })} />
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

function ManageMemberDialog({ member, onDone }: { member: Member; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(member.member_status);
  const [balance, setBalance] = useState(String(member.member_balance));
  const updateStatus = useServerFn(setMemberStatus);
  const updateBalance = useServerFn(setMemberBalance);

  const statusMut = useMutation({
    mutationFn: () => updateStatus({ data: { userId: member.id, status } }),
  });
  const balanceMut = useMutation({
    mutationFn: () => updateBalance({ data: { userId: member.id, balance: Number(balance) } }),
  });

  const save = async () => {
    try {
      if (status !== member.member_status) await statusMut.mutateAsync();
      if (Number(balance) !== member.member_balance) await balanceMut.mutateAsync();
      toast.success("Member updated");
      setOpen(false);
      onDone();
    } catch (e) {
      toast.error("Update failed", { description: (e as Error).message });
    }
  };

  const saving = statusMut.isPending || balanceMut.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {member.full_name || "member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Membership status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Member balance (BDT)</Label>
            <Input
              type="number"
              min={0}
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Eligible loan: {formatBDT(Number(balance) * 10)} (10× balance)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="hero" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
