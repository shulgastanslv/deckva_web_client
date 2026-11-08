import {
  BillingPaymentKind,
  BillingPaymentStatus,
  SubscriptionStatus,
} from "@/lib/generated/prisma/enums";

export { BillingPaymentKind, BillingPaymentStatus, SubscriptionStatus };

export function isBillableSubscriptionStatus(
  status: SubscriptionStatus | string,
): boolean {
  return (
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.PAST_DUE
  );
}
