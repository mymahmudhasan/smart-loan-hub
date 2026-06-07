import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

export const FOOTER_BANNER_ICONS = [
  "Lock",
  "Landmark",
  "Headphones",
  "ShieldCheck",
  "BadgeCheck",
  "Award",
  "Clock",
  "Phone",
  "Mail",
  "Star",
  "Sparkles",
  "Heart",
] as const;
export type FooterBannerIcon = (typeof FOOTER_BANNER_ICONS)[number];

export type FooterBannerBadge = { icon: FooterBannerIcon; label: string };
export type FooterBannerLink = { label: string; href: string };

export type FooterBanner = {
  id: string;
  title: string;
  subtitle: string;
  badges: FooterBannerBadge[];
  links: FooterBannerLink[];
  active: boolean;
};

const badgeSchema = z.object({
  icon: z.enum(FOOTER_BANNER_ICONS),
  label: z.string().min(1).max(60),
});
const linkSchema = z.object({
  label: z.string().min(1).max(60),
  href: z.string().min(1).max(200),
});

function normalize(row: Record<string, unknown> | null): FooterBanner | null {
  if (!row) return null;
  const badges = Array.isArray(row.badges)
    ? (row.badges as unknown[]).filter(
        (b): b is FooterBannerBadge =>
          !!b &&
          typeof (b as FooterBannerBadge).label === "string" &&
          FOOTER_BANNER_ICONS.includes((b as FooterBannerBadge).icon),
      )
    : [];
  const links = Array.isArray(row.links)
    ? (row.links as unknown[]).filter(
        (l): l is FooterBannerLink =>
          !!l &&
          typeof (l as FooterBannerLink).label === "string" &&
          typeof (l as FooterBannerLink).href === "string",
      )
    : [];
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    badges,
    links,
    active: Boolean(row.active),
  };
}

// ---------- Public: footer banner for the website ----------
export const getFooterBanner = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("footer_banner")
    .select("id, title, subtitle, badges, links, active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return normalize(data as Record<string, unknown> | null);
});

const bannerInput = z.object({
  title: z.string().max(120),
  subtitle: z.string().max(240),
  badges: z.array(badgeSchema).max(6),
  links: z.array(linkSchema).max(6),
  active: z.boolean(),
});

// ---------- Admin: update footer banner ----------
export const updateFooterBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bannerInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      badges: data.badges,
      links: data.links,
      active: data.active,
    };
    const { data: existing } = await supabaseAdmin
      .from("footer_banner")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let id = existing?.id as string | undefined;
    if (id) {
      const { error } = await supabaseAdmin.from("footer_banner").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("footer_banner")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row?.id;
    }
    await logAudit({
      actorId: context.userId,
      action: "update_footer_banner",
      entityType: "footer_banner",
      entityId: id,
      details: { active: data.active },
    });
    return { ok: true, id };
  });
