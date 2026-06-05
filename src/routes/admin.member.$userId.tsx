import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Banknote,
  ScrollText,
  Loader2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getMemberDetail, addMemberTransaction, setTransactionStatus, requestMemberDocuments, approveMemberAccount } from "@/lib/admin.functions";
import { formatBDT } from "@/lib/format";
import { eligibleLoanAmount } from "@/lib/loan";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/member/$userId")({
  component: MemberDetail,
  errorComponent: ({ error }) => (
    <Card className="shadow-soft">
      <CardContent className="p-8 text-center text-sm text-muted-foreground">
        Could not load member: {error.message}
      </CardContent>
    </Card>
  ),
});

type Detail = Awaited<ReturnType<typeof getMemberDetail>>;

function MemberDetail() {
  const { userId } = Route.useParams();
  const fetchDetail = useServerFn(getMemberDetail);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "member", userId],
    queryFn: () => fetchDetail({ data: { userId } }) as Promise<Detail>,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  const profile = data?.profile;
  if (!profile) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">Member not found.</CardContent>
      </Card>
    );
  }

  const balance = Number(profile.member_balance ?? 0);
  const eligible = eligibleLoanAmount(balance);
  const activeLoan = (data!.loans ?? []).find((l) => l.status === "disbursed" || l.status === "approved");

  const kpis = [
    { label: "Member Balance", value: formatBDT(balance), icon: Wallet },
    { label: "Eligible Loan (10×)", value: formatBDT(eligible), icon: TrendingUp },
    { label: "Active Loan", value: activeLoan ? formatBDT(Number(activeLoan.amount)) : "—", icon: Banknote },
    { label: "Loan Requests", value: String((data!.loans ?? []).length), icon: ScrollText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold">{profile.full_name || "Unnamed member"}</h2>
            <p className="text-sm text-muted-foreground">
              {profile.email || "—"} · {profile.phone || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={profile.member_status} />
          {data!.roles.includes("admin") && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Admin</span>
          )}
          <AddTransactionDialog userId={userId} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-soft">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-2xl font-bold">{k.value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-primary">
                <k.icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionsCard userId={userId} transactions={data!.transactions} />
        <LoansCard loans={data!.loans} />
      </div>

      <AccountApprovalCard userId={userId} profile={profile} kyc={data!.kyc} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard profile={profile} />
        <ActivityCard activity={data!.activity} />
      </div>

    </div>
  );
}

function TransactionsCard({
  userId,
  transactions,
}: {
  userId: string;
  transactions: Detail["transactions"];
}) {
  const qc = useQueryClient();
  const review = useServerFn(setTransactionStatus);
  const approve = useMutation({
    mutationFn: (id: string) => review({ data: { id, status: "completed", adjustBalance: true } }),
    onSuccess: () => {
      toast.success("Transaction approved");
      qc.invalidateQueries({ queryKey: ["admin", "member", userId] });
    },
    onError: (e) => toast.error("Failed", { description: (e as Error).message }),
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="divide-y">
            {transactions.map((tx) => {
              const inflow = tx.type === "deposit";
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      inflow ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {inflow ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize">{tx.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.method ? `${tx.method} · ` : ""}
                      {format(new Date(tx.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBDT(Number(tx.amount))}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                  {tx.status === "pending" && (
                    <Button
                      size="sm"
                      variant="accent"
                      disabled={approve.isPending}
                      onClick={() => approve.mutate(tx.id)}
                    >
                      Approve
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function LoansCard({ loans }: { loans: Detail["loans"] }) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Loan applications</CardTitle>
      </CardHeader>
      <CardContent>
        {loans.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No loan applications.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>EMI</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{formatBDT(Number(l.amount))}</TableCell>
                  <TableCell>{l.months} mo</TableCell>
                  <TableCell>{formatBDT(Number(l.emi))}</TableCell>
                  <TableCell>
                    <StatusBadge status={l.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ProfileCard({ profile }: { profile: NonNullable<Detail["profile"]> }) {
  const rows = [
    { l: "Full name", v: profile.full_name },
    { l: "Email", v: profile.email },
    { l: "Phone", v: profile.phone },
    { l: "NID", v: profile.nid_number },
    { l: "Address", v: profile.address },
    { l: "Joined", v: profile.created_at ? format(new Date(profile.created_at), "dd MMM yyyy") : null },
  ];
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          {rows.map((r) => (
            <div key={r.l} className="flex justify-between gap-4 py-2.5 text-sm">
              <dt className="text-muted-foreground">{r.l}</dt>
              <dd className="text-right font-medium">{r.v || "—"}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ActivityCard({ activity }: { activity: Detail["activity"] }) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">Activity log</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded.</p>
        ) : (
          <ul className="divide-y">
            {activity.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {format(new Date(log.created_at), "dd MMM, HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AddTransactionDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [adjust, setAdjust] = useState(true);
  const router = useRouter();
  const qc = useQueryClient();
  const add = useServerFn(addMemberTransaction);

  const mut = useMutation({
    mutationFn: () =>
      add({
        data: {
          userId,
          type: type as "deposit" | "withdrawal" | "emi_payment" | "disbursement" | "adjustment",
          amount: Number(amount),
          note: note || undefined,
          adjustBalance: adjust,
        },
      }),
    onSuccess: () => {
      toast.success("Transaction recorded");
      setOpen(false);
      setAmount("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin", "member", userId] });
      router.invalidate();
    },
    onError: (e) => toast.error("Failed", { description: (e as Error).message }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm">
          <Plus className="h-4 w-4" /> Add transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="emi_payment">EMI payment</SelectItem>
                <SelectItem value="disbursement">Disbursement</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount (BDT)</Label>
            <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={adjust} onCheckedChange={(v) => setAdjust(!!v)} />
            Update member balance (deposit adds, others subtract)
          </label>
        </div>
        <DialogFooter>
          <Button
            variant="hero"
            onClick={() => mut.mutate()}
            disabled={mut.isPending || !amount || Number(amount) <= 0}
          >
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
