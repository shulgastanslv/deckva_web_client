import { createHash, randomBytes } from "crypto";

import {
  detectCardBrand,
  digitsOnly,
  normalizeExpiryYear,
  validateCardInput,
} from "@/lib/billing/card";
import type {
  CardInput,
  ChargeResult,
  PaymentProvider,
  PaymentWebhookEvent,
  TokenizedCard,
} from "@/lib/billing/types";

function sandboxToken(cardNumber: string, expMonth: number, expYear: number) {
  const raw = `${digitsOnly(cardNumber)}:${expMonth}:${expYear}:${randomBytes(8).toString("hex")}`;
  return `sandbox_${createHash("sha256").update(raw).digest("hex").slice(0, 32)}`;
}

export const sandboxProvider: PaymentProvider = {
  id: "sandbox",

  async tokenizeCard(input: CardInput): Promise<TokenizedCard> {
    const err = validateCardInput(input);
    if (err) throw new Error(err);
    const number = digitsOnly(input.number);
    const expYear = normalizeExpiryYear(input.expYear);
    return {
      token: sandboxToken(number, input.expMonth, expYear),
      brand: detectCardBrand(number),
      last4: number.slice(-4),
      expMonth: input.expMonth,
      expYear,
      customerId: `sandbox_cus_${createHash("sha256").update(number).digest("hex").slice(0, 16)}`,
    };
  },

  async chargeCard(params): Promise<ChargeResult> {
    if (!params.token.startsWith("sandbox_")) {
      return { ok: false, error: "Unknown payment method" };
    }
    if (params.amount <= 0) return { ok: false, error: "Invalid amount" };
    return {
      ok: true,
      providerRef: `sandbox_pay_${randomBytes(10).toString("hex")}_${params.currency}${params.amount}`,
    };
  },

  async parseWebhook(
    _request: Request,
    body: unknown,
  ): Promise<PaymentWebhookEvent | null> {
    if (!body || typeof body !== "object") return null;
    const row = body as Record<string, unknown>;
    if (row.provider !== "sandbox") return null;
    const status = row.status === "succeeded" ? "payment.succeeded" : "payment.failed";
    return {
      type: status,
      providerRef: typeof row.providerRef === "string" ? row.providerRef : undefined,
      userId: typeof row.userId === "string" ? row.userId : undefined,
      amount: typeof row.amount === "number" ? row.amount : undefined,
      currency: typeof row.currency === "string" ? row.currency : undefined,
      raw: body,
    };
  },
};
