import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

export type ContactInfo = {
  id: string;
  hotline: string;
  email: string;
  office: string;
};

function normalize(row: Record<string, unknown> | null): ContactInfo | null {
  if (!row) return null;
  return {
    id: String(row.id),
    hotline: String(row.hotline ?? ""),
    email: String(row.email ?? ""),
    office: String(row.office ?? ""),
  };
}

// ---------- Public: contact info for the website ----------
export const getContactInfo = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("contact_info")
    .select("id, hotline, email, office")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return normalize(data as Record<string, unknown> | null);
});

const contactInput = z.object({
  hotline: z.string().max(120),
  email: z.string().max(200),
  office: z.string().max(240),
});

// ---------- Admin: update contact info ----------
export const updateContactInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => contactInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = {
      hotline: data.hotline,
      email: data.email,
      office: data.office,
    };
    const { data: existing } = await supabaseAdmin
      .from("contact_info")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let id = existing?.id as string | undefined;
    if (id) {
      const { error } = await supabaseAdmin.from("contact_info").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("contact_info")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row?.id;
    }
    await logAudit({
      actorId: context.userId,
      action: "update_contact_info",
      entityType: "contact_info",
      entityId: id,
    });
    return { ok: true, id };
  });
