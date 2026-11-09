# Billing & payments

## Product rules

- **Pro subscription** → unlimited AI generations.
- **Free** → `FREE_GENERATION_LIMIT` (3) successful generations, then upgrade dialog.
- Folders stay Pro-only.
- No credit wallet / ledger.

## Env

```bash
# Active adapter: sandbox | bepaid (default: bepaid if keys set, else sandbox)
PAYMENT_PROVIDER=

# Shared secret for POST /api/billing/webhook (optional but recommended)
BILLING_WEBHOOK_SECRET=

# bePaid (optional — only when PAYMENT_PROVIDER=bepaid or keys present)
BEPAID_SHOP_ID=
BEPAID_SECRET_KEY=
BEPAID_API_URL=https://gateway.bepaid.by
BEPAID_TEST=true
BEPAID_WEBHOOK_REQUIRE_AUTH=false
```

## Callback URL

Point your PSP notification URL to:

`https://<your-domain>/api/billing/webhook`

Optional header: `x-deckva-webhook-secret: <BILLING_WEBHOOK_SECRET>`

## Adding another provider

1. Implement `PaymentProvider` in `lib/billing/providers/<name>.ts`
   (`tokenizeCard`, `chargeCard`, optional `parseWebhook`).
2. Register it in `lib/billing/provider.ts`.
3. Set `PAYMENT_PROVIDER=<name>`.

bePaid and sandbox stubs already live under `lib/billing/providers/`.
Webhook normalization is applied in `lib/billing/webhook.ts`.
