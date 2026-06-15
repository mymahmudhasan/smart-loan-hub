import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAudit } from "./admin.server";
import { createCharge, verifyPayment } from "./piprapay.server";

// ---------- Start an online payment via the gateway (deposit / EMI) ----------
export const createPaymentCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { type: string; amount: number; origin: string }) =>
      z
        .object({
          type: z.enum(["deposit", "emi_payment"]),
          amount: z.number().positive().min(10).max(1_000_000),
          origin: z.string().url().max(300),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    const uid = context.userId;

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", uid)
      .maybeSingle();

    // Record a pending transaction first; its id is the gateway invoice id.
    const { data: row, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: uid,
        type: data.type as "deposit" | "emi_payment",
        amount: data.amount,
        method: "online",
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const txId = row!.id as string;

    const origin = data.origin.replace(/\/$/, "");
    let charge;
    try {
      charge = await createCharge({
        full_name: prof?.full_name || "Member",
        email_mobile: prof?.email || prof?.phone || "01700000000",
        amount: String(data.amount),
        metadata: { invoiceid: txId, user_id: uid, type: data.type },
        redirect_url: `${origin}/payment-status`,
        return_type: "GET",
        cancel_url: `${origin}/payments?status=cancelled`,
        webhook_url: `${origin}/api/public/piprapay-webhook`,
        currency: "BDT",
      });
    } catch (e) {
      // Roll the pending row back so it doesn't linger if the gateway rejects.
      await supabaseAdmin.from("transactions").delete().eq("id", txId);
      throw e;
    }

    const ppId = charge.pp_id != null ? String(charge.pp_id) : null;
    await supabaseAdmin
      .from("transactions")
      .update({ reference: ppId })
      .eq("id", txId);

    // Deposit starts the 72h real-account approval window (once).
    if (data.type === "deposit") {
      const { data: p } = await supabaseAdmin
        .from("profiles")
        .select("approval_started_at, member_status")
        .eq("id", uid)
        .maybeSingle();
      if (p && !p.approval_started_at && p.member_status !== "verified") {
        await supabaseAdmin
          .from("profiles")
          .update({ approval_started_at: new Date().toISOString() })
          .eq("id", uid);
      }
    }

    await logAudit({
      actorId: uid,
      action: `member_${data.type}_online_initiated`,
      entityType: "transactions",
      entityId: txId,
      details: { amount: data.amount, pp_id: ppId },
    });

    return { ok: true, checkoutUrl: charge.pp_url, ppId, transactionId: txId };
  });

// ---------- Verify a payment after redirect back from the gateway ----------
export const verifyMyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ppId: string }) =>
    z.object({ ppId: z.string().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const result = await verifyPayment(data.ppId);
    const paid = (result.status ?? "").toLowerCase() === "completed";
    const txId = (result.metadata?.invoiceid as string | undefined) ?? null;

    if (paid && txId) {
      // Only update the caller's own pending transaction.
      const { data: updated } = await supabaseAdmin
        .from("transactions")
        .update({
          status: "completed",
          reference: data.ppId,
          note: result.transaction_id ? `txid:${result.transaction_id}` : null,
        })
        .eq("id", txId)
        .eq("user_id", context.userId)
        .eq("status", "pending")
        .select("id, amount, type")
        .maybeSingle();

      if (updated) {
        await logAudit({
          actorId: context.userId,
          action: "member_payment_verified",
          entityType: "transactions",
          entityId: updated.id,
          details: { pp_id: data.ppId, amount: updated.amount },
        });
      }
    }

    return {
      paid,
      status: result.status ?? "unknown",
      amount: result.amount ?? null,
      transactionId: txId,
    };
  });
