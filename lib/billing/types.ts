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

export interface BillingPaymentDto {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  kind: "SUBSCRIPTION" | "CARD_VERIFY" | "REFUND";
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
  status: "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  subscriptionEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
  paymentMethod: PaymentMethodDto | null;
  payments: BillingPaymentDto[];
}
