import { useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, ShieldCheck, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle, LanguageToggle } from "@/components/layout/Toggles";
import { useLanguage } from "@/context/language";
import { useAuth } from "@/context/auth";
import { useBranding } from "@/context/branding";
import { UserProfileBadge } from "@/components/shared/UserProfileBadge";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", key: "nav_home" as const },
  { to: "/membership", key: "nav_membership" as const },
  { to: "/calculator", key: "nav_calculator" as const },
  { to: "/dashboard", key: "nav_dashboard" as const },
  { to: "/profile", key: "nav_profile" as const },
  { to: "/payments", key: "nav_payments" as const },
  { to: "/faq", key: "nav_faq" as const },
  { to: "/contact", key: "nav_contact" as const },
];

export function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, signOut } = useAuth();
  const { logoUrl, brandName } = useBranding();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName ?? t("brand")}
              className="h-9 w-9 rounded-xl object-contain shadow-soft"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </span>
          )}
          <span className="hidden sm:inline">{brandName ?? t("brand")}</span>
        </Link>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />

          {isAdmin && (
            <Button variant="accent" size="sm" className="hidden sm:inline-flex gap-1.5" asChild>
              <Link to="/admin">
                <LayoutDashboard className="h-4 w-4" /> Admin Panel
              </Link>
            </Button>
          )}

          {user ? (
            <UserProfileBadge />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link to="/login" aria-label={t("nav_login")}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-left">{t("brandFull")}</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                      pathname === l.to ? "text-primary bg-primary/10" : "text-foreground",
                    )}
                  >
                    {t(l.key)}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  {isAdmin && (
                    <Button variant="accent" asChild onClick={() => setOpen(false)}>
                      <Link to="/admin">
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </Link>
                    </Button>
                  )}
                  {user ? (
                    <>
                      <Button variant="outline" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" /> Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild onClick={() => setOpen(false)}>
                        <Link to="/login">{t("nav_login")}</Link>
                      </Button>
                      <Button variant="hero" asChild onClick={() => setOpen(false)}>
                        <Link to="/signup">{t("nav_signup")}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
