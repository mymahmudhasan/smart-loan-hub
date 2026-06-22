import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

export type WhatsappQuestion = {
  label: { en: string; bn: string };
  message: string;
};

export type ContactInfo = {
  id: string;
  hotline: string;
  email: string;
  office: string;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappQuestions: WhatsappQuestion[];
};

function normalize(row: Record<string, unknown> | null): ContactInfo | null {
  if (!row) return null;
  let questions: WhatsappQuestion[] = [];
  if (row.whatsapp_questions && Array.isArray(row.whatsapp_questions)) {
    questions = (row.whatsapp_questions as unknown[])
      .map((q) => {
        const item = q as Record<string, unknown> | null;
        if (!item) return null;
        const label = item.label as Record<string, unknown> | undefined;
        return {
          label: {
            en: String(label?.en ?? ""),
            bn: String(label?.bn ?? ""),
          },
          message: String(item.message ?? ""),
        };
      })
      .filter((q): q is WhatsappQuestion => q !== null && Boolean(q.label.en.trim() || q.label.bn.trim()));
  }
  return {
    id: String(row.id),
    hotline: String(row.hotline ?? ""),
    email: String(row.email ?? ""),
    office: String(row.office ?? ""),
    whatsappNumber: String(row.whatsapp_number ?? ""),
    whatsappMessage: String(row.whatsapp_message ?? ""),
    whatsappQuestions: questions,
  };
}

// ---------- Public: contact info for the website ----------
export const getContactInfo = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("contact_info")
    .select("id, hotline, email, office, whatsapp_number, whatsapp_message, whatsapp_questions")
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
  whatsappNumber: z.string().max(40),
  whatsappMessage: z.string().max(500),
  whatsappQuestions: z.array(
    z.object({
      label: z.object({ en: z.string(), bn: z.string() }),
      message: z.string().max(500),
    }),
  ),
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
      whatsapp_number: data.whatsappNumber,
      whatsapp_message: data.whatsappMessage,
      whatsapp_questions: data.whatsappQuestions,
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
