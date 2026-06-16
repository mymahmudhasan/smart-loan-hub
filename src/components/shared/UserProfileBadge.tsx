import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserProfileBadge() {
  const { user } = useAuth();
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Member";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Link
      to="/profile"
      className="flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 shadow-soft border border-border/50 hover:bg-card transition-colors"
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
          {initial}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
    </Link>
  );
}
