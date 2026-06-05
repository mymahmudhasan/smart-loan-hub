import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Banknote,
  ShieldAlert,
  ScrollText,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { claimAdmin } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Panel | Smart Loan" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/kyc", label: "KYC Review", icon: FileCheck2 },
  { to: "/admin/loans", label: "Loan Applications", icon: Banknote },
  { to: "/admin/fraud", label: "Fraud Flags", icon: ShieldAlert },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
];

function AdminLayout() {
  const { user, isAdmin, loading, refreshRole } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const claim = useServerFn(claimAdmin);
  const [claiming, setClaiming] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Gate
        title="Sign in required"
        body="You need to sign in with an administrator account to access the admin panel."
        action={<Button variant="hero" onClick={() => navigate({ to: "/login" })}>Go to login</Button>}
      />
    );
  }

  if (!isAdmin) {
    const handleClaim = async () => {
      setClaiming(true);
      try {
        const res = await claim();
        if (res.claimed) {
          await refreshRole();
          toast.success("You are now an administrator");
        } else {
          toast.error("Admin already assigned", {
            description: "An administrator already exists. Ask them to grant you access.",
          });
        }
      } catch (e) {
        toast.error("Could not claim admin", { description: (e as Error).message });
      } finally {
        setClaiming(false);
      }
    };
    return (
      <Gate
        title="Administrator access only"
        body="Your account doesn't have admin privileges. If this platform has no admin yet, you can claim the first administrator account."
        action={
          <Button variant="hero" onClick={handleClaim} disabled={claiming}>
            {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Claim first admin
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage members, verify KYC, review loans and monitor fraud.</p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Gate({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-elegant">
        <CardHeader>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-primary">
            <Lock className="h-6 w-6" />
          </span>
          <CardTitle className="mt-3">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">{body}</p>
          {action}
        </CardContent>
      </Card>
    </div>
  );
}
