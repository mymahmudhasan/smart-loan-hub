// Server-only helpers for admin operations. Never import from client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Throws if the given user is not an admin. */
export async function assertAdmin(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Failed to verify admin role");
  if (!data) throw new Error("Forbidden: admin role required");
}

/** Writes an immutable audit log entry. */
export async function logAudit(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: params.actorId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    details: params.details ?? {},
  });
}
