import { Link, useNavigate } from "@tanstack/react-router";
import { Calculator, CreditCard, Crown, LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const profileMenuItems = [
  { label: "Membership", to: "/membership", icon: Crown },
  { label: "Loan Calculator", to: "/calculator", icon: Calculator },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", to: "/profile", icon: User },
  { label: "Payment", to: "/payments", icon: CreditCard },
] as const;

export function UserProfileBadge() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Member";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="User menu"
          className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-soft border border-border hover:bg-muted hover:shadow-md transition-colors cursor-pointer"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.to} asChild>
              <Link to={item.to} className="cursor-pointer">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
