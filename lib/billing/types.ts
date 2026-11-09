import type {
  BillingPaymentKind,
  BillingPaymentStatus,
  SubscriptionStatus,
} from "@/lib/domain/billing";

export type CardBrand =
  | "visa"
  | "mastercard"
  | "mir"
  | "belkart"
  | "amex"
  | "unknown";

export interface CardInput {
  number: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  holder?: string;
}

export interface TokenizedCard {
  token: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  customerId?: string;
}

export interface ChargeResult {
  ok: boolean;
  providerRef?: string;
  error?: string;
}

/** Normalized webhook event from any payment provider. */
export type PaymentWebhookEvent = {
  type:
    | "payment.succeeded"
    | "payment.failed"
    | "subscription.canceled"
    | "unknown";
  providerRef?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  raw: unknown;
};

export type PaymentProviderId = "sandbox" | "bepaid";

/** Provider-agnostic payment adapter. Swap implementations via PAYMENT_PROVIDER. */
export interface PaymentProvider {
  readonly id: PaymentProviderId;
  tokenizeCard(input: CardInput): Promise<TokenizedCard>;
  chargeCard(params: {
    token: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<ChargeResult>;
  /**
   * Verify signature / parse provider callback body into a normalized event.
   * Return null if the payload is not for this provider.
   */
  parseWebhook?(
    request: Request,
    body: unknown,
  ): Promise<PaymentWebhookEvent | null>;
}

export interface BillingPaymentDto {
  id: string;
  amount: number;
  currency: string;
  status: BillingPaymentStatus;
  kind: BillingPaymentKind;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
  cardLast4: string | null;
  cardBrand: string | null;
}

export interface PaymentMethodDto {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface BillingSnapshot {
  isPro: boolean;
  status: SubscriptionStatus;
  subscriptionEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
  paymentMethod: PaymentMethodDto | null;
  payments: BillingPaymentDto[];
  /** Free-plan generation quota (ignored when isPro). */
  freeGenerationsUsed: number;
  freeGenerationsLimit: number;
  freeGenerationsRemaining: number;
}
