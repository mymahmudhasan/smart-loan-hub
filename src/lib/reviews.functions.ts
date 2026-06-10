import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertAdmin, logAudit } from "./admin.server";

export type ClientReview = {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  review_title: string | null;
  avatar_url: string | null;
  rating: number;
  content: string;
  created_at: string;
};

export type AdminReview = ClientReview & {
  user_id: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  updated_at: string;
};

// ---------- Public: approved reviews for the homepage ----------
export const listApprovedReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("client_reviews")
    .select("id, reviewer_name, reviewer_role, review_title, avatar_url, rating, content, created_at")
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .limit(24);
  if (error) return [] as ClientReview[];
  return (data ?? []) as ClientReview[];
});

// ---------- Member: submit a review (goes to pending) ----------
const reviewInput = z.object({
  reviewer_name: z.string().trim().min(2).max(80),
  reviewer_role: z.string().trim().max(120).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(10).max(1000),
});

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reviewInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("client_reviews").insert({
      user_id: context.userId,
      reviewer_name: data.reviewer_name,
      reviewer_role: data.reviewer_role || null,
      rating: data.rating,
      content: data.content,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Member: my own submitted reviews ----------
export const listMyReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("client_reviews")
      .select("id, reviewer_name, reviewer_role, rating, content, status, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  });

// ---------- Admin: list all reviews ----------
export const listAllReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("client_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminReview[];
  });

// ---------- Admin: approve / reject a review ----------
export const moderateReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected", "pending"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("client_reviews")
      .update({
        status: data.status,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "moderate_review",
      entityType: "client_reviews",
      entityId: data.id,
      details: { status: data.status },
    });
    return { ok: true };
  });

// ---------- Admin: delete a review ----------
export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("client_reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "delete_review",
      entityType: "client_reviews",
      entityId: data.id,
    });
    return { ok: true };
  });
