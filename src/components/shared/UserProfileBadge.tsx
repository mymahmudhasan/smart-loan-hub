import { Link, useNavigate } from "@tanstack/react-router";
import { Calculator, CreditCard, Crown, LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserProfileBadge() {
  const { user, signOut } = useAuth();
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const navigate = useNavigate();

  const profileMenuItems = [
    { label: t("nav_profile"), to: "/profile", icon: User },
    { label: t("nav_dashboard"), to: "/dashboard", icon: LayoutDashboard },
    { label: t("nav_membership"), to: "/membership", icon: Crown },
    { label: t("nav_calculator"), to: "/calculator", icon: Calculator },
    { label: t("nav_payments"), to: "/payments", icon: CreditCard },
  ] as const;

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : null) ||
    L("Member", "সদস্য");
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
          title={L("User menu", "ব্যবহারকারী মেনু")}
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
          <span>{L("Sign out", "সাইন আউট")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
