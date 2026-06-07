import { Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Landmark, Headphones } from "lucide-react";
import { useLanguage } from "@/context/language";

function BannerStrip() {
  const { t } = useLanguage();
  const items = [
    { icon: Lock, label: t("footer_banner_secure") },
    { icon: Landmark, label: t("footer_banner_regulated") },
    { icon: Headphones, label: t("footer_banner_support") },
  ];
  return (
    <div className="relative overflow-hidden border-b bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-foreground">{t("footer_banner_title")}</h3>
          <p className="text-sm text-muted-foreground">{t("footer_banner_subtitle")}</p>
        </div>
        <div className="flex items-center gap-6">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="h-4 w-4 text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const cols = [
    {
      title: t("nav_membership"),
      links: [
        { to: "/membership", label: t("nav_membership") },
        { to: "/calculator", label: t("nav_calculator") },
        { to: "/apply", label: t("apply_now") },
        { to: "/dashboard", label: t("nav_dashboard") },
      ],
    },
    {
      title: t("nav_contact"),
      links: [
        { to: "/faq", label: t("nav_faq") },
        { to: "/contact", label: t("nav_contact") },
        { to: "/payments", label: t("nav_payments") },
      ],
    },
    {
      title: "Legal",
      links: [
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/terms", label: "Terms & Conditions" },
      ],
    },
  ];

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            {t("brand")}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t("footer_tagline")}</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-5">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          © {year} {t("brandFull")}. {t("footer_rights")}
        </p>
      </div>
    </footer>
  );
}
