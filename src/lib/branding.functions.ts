import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

export type SiteBranding = {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  brandName: string | null;
};

function normalize(row: Record<string, unknown> | null): SiteBranding | null {
  if (!row) return null;
  return {
    id: String(row.id),
    logoUrl: (row.logo_url as string | null) ?? null,
    faviconUrl: (row.favicon_url as string | null) ?? null,
    brandName: (row.brand_name as string | null) ?? null,
  };
}

// ---------- Public: branding for the website ----------
export const getBranding = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_branding")
    .select("id, logo_url, favicon_url, brand_name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return normalize(data as Record<string, unknown> | null);
});

// Accept data: image URLs (uploaded files) up to ~2MB encoded, or null to clear.
const imageData = z
  .string()
  .max(2_800_000)
  .regex(/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon);base64,/, {
    message: "Must be an uploaded image",
  })
  .nullable();

const brandingInput = z.object({
  logoUrl: imageData.optional(),
  faviconUrl: imageData.optional(),
  brandName: z.string().max(60).nullable().optional(),
});

// ---------- Admin: update branding ----------
export const updateBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => brandingInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: existing } = await supabaseAdmin
      .from("site_branding")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const payload: {
      logo_url?: string | null;
      favicon_url?: string | null;
      brand_name?: string | null;
    } = {};
    if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl;
    if (data.faviconUrl !== undefined) payload.favicon_url = data.faviconUrl;
    if (data.brandName !== undefined) payload.brand_name = data.brandName;

    let id = existing?.id as string | undefined;
    if (id) {
      const { error } = await supabaseAdmin.from("site_branding").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("site_branding")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row?.id;
    }

    await logAudit({
      actorId: context.userId,
      action: "update_branding",
      entityType: "site_branding",
      entityId: id,
      details: {
        logoChanged: data.logoUrl !== undefined,
        faviconChanged: data.faviconUrl !== undefined,
      },
    });
    return { ok: true, id };
  });
