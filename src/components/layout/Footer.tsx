import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Lock, Landmark, Headphones } from "lucide-react";
import { useLanguage } from "@/context/language";
import { getFooterBanner, type FooterBanner } from "@/lib/footer-banner.functions";
import { footerBannerIconMap } from "@/components/layout/footerBannerIcons";

function isExternal(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

function BannerStrip() {
  const { t } = useLanguage();
  const fetchBanner = useServerFn(getFooterBanner);
  const { data } = useQuery<FooterBanner | null>({
    queryKey: ["footer-banner"],
    queryFn: () => fetchBanner(),
  });

  // Fallback to translated defaults until config loads / when none set.
  const fallbackBadges = [
    { Icon: Lock, label: t("footer_banner_secure") },
    { Icon: Landmark, label: t("footer_banner_regulated") },
    { Icon: Headphones, label: t("footer_banner_support") },
  ];

  if (data && !data.active) return null;

  const title = data?.title || t("footer_banner_title");
  const subtitle = data?.subtitle || t("footer_banner_subtitle");
  const badges =
    data && data.badges.length > 0
      ? data.badges.map((b) => ({ Icon: footerBannerIconMap[b.icon] ?? ShieldCheck, label: b.label }))
      : fallbackBadges;
  const links = data?.links ?? [];

  return (
    <div className="relative overflow-hidden border-b bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {badges.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.Icon className="h-4 w-4 text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      {links.length > 0 && (
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t px-4 py-3 sm:justify-start">
          {links.map((l, i) => (
            <a
              key={i}
              href={l.href}
              {...(isExternal(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-sm text-primary transition-colors hover:underline"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

    </div>
  );
}


export function Footer() {
  const { t, lang } = useLanguage();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
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
      title: L("Legal", "আইনগত"),
      links: [
        { to: "/privacy", label: L("Privacy Policy", "গোপনীয়তা নীতি") },
        { to: "/terms", label: L("Terms & Conditions", "শর্তাবলী") },
      ],
    },
  ];

  return (
    <footer className="border-t bg-card">
      <BannerStrip />
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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {year} {t("brandFull")}. {t("footer_rights")}
          </p>
          <Link
            to="/admin-login"
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Lock className="h-3 w-3" /> Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
