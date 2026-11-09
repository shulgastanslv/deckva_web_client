import { bepaidProvider, isBepaidConfigured } from "@/lib/billing/providers/bepaid";
import { sandboxProvider } from "@/lib/billing/providers/sandbox";
import type {
  CardInput,
  ChargeResult,
  PaymentProvider,
  PaymentProviderId,
  PaymentWebhookEvent,
  TokenizedCard,
} from "@/lib/billing/types";
import {
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
} from "@/lib/studio/plans";

/**
 * Active payment adapter.
 *
 * Env:
 * - PAYMENT_PROVIDER=sandbox|bepaid (optional; auto-picks bepaid when keys exist)
 * - BEPAID_SHOP_ID / BEPAID_SECRET_KEY / BEPAID_API_URL / BEPAID_TEST
 *
 * To plug another PSP: add `lib/billing/providers/<name>.ts` implementing
 * `PaymentProvider`, register it in `providers`, then set PAYMENT_PROVIDER.
 */
const providers: Record<PaymentProviderId, PaymentProvider> = {
  sandbox: sandboxProvider,
  bepaid: bepaidProvider,
};

export function resolvePaymentProviderId(): PaymentProviderId {
  const forced = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (forced === "sandbox" || forced === "bepaid") return forced;
  return isBepaidConfigured() ? "bepaid" : "sandbox";
}

export function getPaymentProvider(): PaymentProvider {
  return providers[resolvePaymentProviderId()];
}

export function getPaymentProviderMode(): PaymentProviderId {
  return resolvePaymentProviderId();
}

export async function tokenizeCard(input: CardInput): Promise<TokenizedCard> {
  return getPaymentProvider().tokenizeCard(input);
}

export async function chargeCard(params: {
  token: string;
  amount?: number;
  currency?: string;
  description?: string;
}): Promise<ChargeResult> {
  const provider = getPaymentProvider();
  // Sandbox tokens always go through sandbox even if bePaid is active.
  if (params.token.startsWith("sandbox_")) {
    return sandboxProvider.chargeCard({
      token: params.token,
      amount: params.amount ?? STUDIO_PRO_PRICE,
      currency: params.currency ?? STUDIO_PRO_CURRENCY,
      description: params.description ?? "Deckva Pro",
    });
  }
  return provider.chargeCard({
    token: params.token,
    amount: params.amount ?? STUDIO_PRO_PRICE,
    currency: params.currency ?? STUDIO_PRO_CURRENCY,
    description: params.description ?? "Deckva Pro",
  });
}

export async function parsePaymentWebhook(
  request: Request,
  body: unknown,
): Promise<PaymentWebhookEvent | null> {
  const provider = getPaymentProvider();
  if (!provider.parseWebhook) return null;
  return provider.parseWebhook(request, body);
}
