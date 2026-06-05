import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

export type BannerOffer = {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  cta_label: string;
  cta_href: string;
  theme: string;
  cta_style: string;
  text_style: string;
  sort_order: number;
  active: boolean;
};

// ---------- Public: active offers for the homepage banner ----------
export const listActiveBanners = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("banner_offers")
    .select(
      "id, title, subtitle, badge, cta_label, cta_href, theme, cta_style, text_style, sort_order, active",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return [] as BannerOffer[];
  return (data ?? []) as BannerOffer[];
});

// ---------- Admin: all offers ----------
export const listAllBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("banner_offers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as BannerOffer[];
  });

const bannerInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(120),
  subtitle: z.string().max(240).optional().nullable(),
  badge: z.string().max(40).optional().nullable(),
  cta_label: z.string().min(1).max(40),
  cta_href: z.string().min(1).max(200),
  theme: z.enum(["primary", "gold", "emerald", "midnight"]),
  cta_style: z.enum(["glass", "solid", "outline", "gold", "ghost"]),
  text_style: z.enum(["classic", "centered", "spotlight", "minimal"]),
  sort_order: z.number().int().min(0).max(999),
  active: z.boolean(),
});

export const upsertBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bannerInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = {
      title: data.title,
      subtitle: data.subtitle ?? null,
      badge: data.badge ?? null,
      cta_label: data.cta_label,
      cta_href: data.cta_href,
      theme: data.theme,
      cta_style: data.cta_style,
      text_style: data.text_style,
      sort_order: data.sort_order,
      active: data.active,
    };
    let id = data.id;
    if (id) {
      const { error } = await supabaseAdmin.from("banner_offers").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("banner_offers")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row?.id;
    }
    await logAudit({
      actorId: context.userId,
      action: data.id ? "update_banner" : "create_banner",
      entityType: "banner_offers",
      entityId: id,
      details: { title: data.title, active: data.active },
    });
    return { ok: true, id };
  });

export const deleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("banner_offers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "delete_banner",
      entityType: "banner_offers",
      entityId: data.id,
    });
    return { ok: true };
  });
