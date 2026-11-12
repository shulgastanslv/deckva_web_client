# Billing & payments

## Product rules

- **Free** → `FREE_GENERATION_LIMIT` (3) successful generations, then upgrade dialog.
- **Pro subscription** (`STUDIO_PRO_PRICE` BYN / month) → Pro features + `PRO_MONTHLY_CREDITS` generation credits each billing period.
- **Credit pack** → `CREDIT_PACK_CREDITS` for `CREDIT_PACK_PRICE` BYN (Pro only). Adds to top-up balance.
- Each successful AI generation costs `GENERATION_CREDIT_COST` (1) from plan → top-up.
- Folders stay Pro-only.
- Plan balance is reset to the monthly allotment on subscribe / renew; top-up credits roll over.

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
