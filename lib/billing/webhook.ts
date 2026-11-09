import { parsePaymentWebhook } from "@/lib/billing/provider";
import {
  BillingPaymentStatus,
  SubscriptionStatus,
} from "@/lib/domain/billing";
import { prisma } from "@/lib/prisma";
import { addBillingMonth } from "@/lib/studio/plans";

/**
 * Apply a normalized payment webhook.
 * Provider-specific parsing lives in `lib/billing/providers/*`.
 * This handler only updates Deckva subscription / payment rows.
 */
export async function handlePaymentWebhook(
  request: Request,
  body: unknown,
): Promise<{ ok: true; handled: boolean; type?: string } | { ok: false; error: string }> {
  const event = await parsePaymentWebhook(request, body);
  if (!event) {
    return { ok: false, error: "Unrecognized webhook payload" };
  }

  if (event.type === "unknown") {
    return { ok: true, handled: false, type: event.type };
  }

  if (event.type === "payment.succeeded" && event.providerRef) {
    const payment = await prisma.billingPayment.findFirst({
      where: { providerRef: event.providerRef },
      select: { id: true, userId: true, status: true },
    });

    if (payment && payment.status !== BillingPaymentStatus.SUCCEEDED) {
      await prisma.$transaction([
        prisma.billingPayment.update({
          where: { id: payment.id },
          data: {
            status: BillingPaymentStatus.SUCCEEDED,
            paidAt: new Date(),
            failureReason: null,
          },
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: {
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            subscriptionEndsAt: addBillingMonth(new Date()),
            cancelAtPeriodEnd: false,
          },
        }),
      ]);
      return { ok: true, handled: true, type: event.type };
    }

    // Orphan success with userId hint — activate Pro directly.
    if (!payment && event.userId) {
      await prisma.user.update({
        where: { id: event.userId },
        data: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          subscriptionEndsAt: addBillingMonth(new Date()),
          cancelAtPeriodEnd: false,
        },
      });
      return { ok: true, handled: true, type: event.type };
    }
  }

  if (event.type === "payment.failed" && event.providerRef) {
    await prisma.billingPayment.updateMany({
      where: { providerRef: event.providerRef },
      data: {
        status: BillingPaymentStatus.FAILED,
        failureReason: "Provider reported failure",
      },
    });
    return { ok: true, handled: true, type: event.type };
  }

  if (event.type === "subscription.canceled" && event.userId) {
    await prisma.user.update({
      where: { id: event.userId },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: false,
      },
    });
    return { ok: true, handled: true, type: event.type };
  }

  return { ok: true, handled: false, type: event.type };
}
