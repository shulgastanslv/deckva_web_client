import { NextResponse } from "next/server";

import { handlePaymentWebhook } from "@/lib/billing/webhook";

/**
 * Provider-agnostic payment callback.
 *
 * Point your PSP notification URL here, e.g.:
 *   https://your-domain.com/api/billing/webhook
 *
 * Then implement `parseWebhook` on the active provider in
 * `lib/billing/providers/<name>.ts` (sandbox + bePaid stubs included).
 *
 * Optional shared secret:
 *   BILLING_WEBHOOK_SECRET — require header `x-deckva-webhook-secret`
 */
export async function POST(request: Request) {
  const expected = process.env.BILLING_WEBHOOK_SECRET?.trim();
  if (expected) {
    const got = request.headers.get("x-deckva-webhook-secret");
    if (got !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await handlePaymentWebhook(request, body);
  if (result.ok === false) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    handled: result.handled,
    type: result.type ?? null,
  });
}
