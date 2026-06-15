import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { isValidWebhookKey } from "@/lib/piprapay.server";

// PipraPay posts payment status here and includes the merchant API key in the
// `mh-piprapay-api-key` header. We verify that header before trusting the body.
const PayloadSchema = z.object({
  pp_id: z.union([z.string(), z.number()]).optional(),
  status: z.string().optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  transaction_id: z.string().optional(),
  metadata: z
    .object({ invoiceid: z.string().optional() })
    .passthrough()
    .optional(),
});

export const Route = createFileRoute("/api/public/piprapay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headerKey =
          request.headers.get("mh-piprapay-api-key") ??
          request.headers.get("MHS-PIPRAPAY-API-KEY");
        if (!isValidWebhookKey(headerKey)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const raw = await request.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const result = PayloadSchema.safeParse(parsed);
        if (!result.success) {
          return new Response("Invalid payload", { status: 400 });
        }

        const body = result.data;
        const txId = body.metadata?.invoiceid ?? null;
        const paid = (body.status ?? "").toLowerCase() === "completed";

        if (paid && txId) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("transactions")
            .update({
              status: "completed",
              reference: body.pp_id != null ? String(body.pp_id) : undefined,
              note: body.transaction_id ? `txid:${body.transaction_id}` : null,
            })
            .eq("id", txId)
            .eq("status", "pending");
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
