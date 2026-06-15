## Goal

Replace the admin **Payment Config** (bKash/Nagad numbers) with a **Payment Gateway** manager where the admin sets the gateway **API key** and **base URL**. Saving updates the live gateway immediately — no redeploy — because the gateway client reads these values from the database at request time. The member deposit page becomes gateway-only.

## Security note (important)

The existing `deposit_config` table is publicly readable (`SELECT USING (true)`), so the API key must **not** live there. A new admin-only table holds the secret, accessed only through the server (service role). The key is never sent to the browser — the admin UI only ever shows a masked preview (e.g. `••••••1234`) and a "configured" status.

## Changes

### 1. Database (migration)
- Create `public.payment_gateway_config` with: `api_key` (text), `base_url` (text), `is_active` (boolean, default true), `updated_by`, plus `id`/timestamps and the updated-at trigger.
- GRANT to `service_role` only (all access goes through server functions using the admin client). RLS enabled; no anon/authenticated policies — the table is unreadable from the client.
- Seed one empty row.

### 2. Gateway client — `src/lib/piprapay.server.ts`
- Add `getGatewaySettings()` that reads `api_key` + `base_url` from `payment_gateway_config` via the admin client, falling back to the `PAYMENT_GATEWAY_API_KEY` secret and the current default URL when the row is empty.
- `createCharge`, `verifyPayment`, and `isValidWebhookKey` use these DB-sourced values (these functions become async where needed).

### 3. Server functions
- New `src/lib/payment-gateway.functions.ts`:
  - `getGatewayConfigAdmin` (admin-gated): returns `{ base_url, is_active, configured: boolean, masked_key }` — never the raw key.
  - `updateGatewayConfig` (admin-gated): saves `base_url`, `is_active`, and the `api_key` only when a new one is entered (leaving it blank keeps the existing key); writes an audit log.
- Remove the bKash/Nagad pieces from `src/lib/deposit-config.functions.ts` (or retire the file) and drop its use in the member page.

### 4. Admin UI — `src/routes/admin.deposit-config.tsx`
- Replace the two number cards with:
  - **Gateway API Key** — password input with an eye toggle; shows masked current key + "Configured/Not configured" badge; placeholder explains leaving it blank keeps the saved key.
  - **Gateway Base URL** — text input (e.g. `https://pay.auratradeai.tech`).
  - **Active** switch.
  - Save button calling `updateGatewayConfig`.
- Update the sidebar/labels to "Payment Gateway".

### 5. Member deposit page — `src/routes/payments.tsx`
- Make deposit/EMI **gateway-only**: remove the bKash/Nagad number display and the `getDepositConfig` dependency; keep the "Pay Online Now" flow. (Withdrawal keeps its manual method selection since it doesn't go through the gateway.)

### 6. Webhook — `src/routes/api/public/piprapay-webhook.ts`
- `await` the now-async `isValidWebhookKey`.

### 7. Memory
- Update the payment-gateway memory note to reflect that the API key + base URL are admin-managed in the DB and applied immediately.

## Technical notes
- The `PAYMENT_GATEWAY_API_KEY` secret stays as a fallback so existing payments keep working until the admin saves a key in the new UI.
- All reads/writes of the key happen server-side via the admin client; the key column has no client-facing grant or policy.
