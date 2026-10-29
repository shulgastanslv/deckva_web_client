import { prisma } from "@/lib/prisma";
import {
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
  addBillingMonth,
} from "@/lib/studio/plans";
import { chargeCard } from "@/lib/billing/provider";

export function isProStatus(
  status: "NONE" | "ACTIVE" | "PAST_DUE" | "CANCELED",
  endsAt: Date | null | undefined,
) {
  if (status !== "ACTIVE" && status !== "PAST_DUE") return false;
  if (!endsAt) return status === "ACTIVE";
  return endsAt.getTime() > Date.now();
}

/** Refresh period / attempt renewal if needed, then return whether user has Pro. */
export async function userHasPro(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      cancelAtPeriodEnd: true,
      paymentMethods: {
        where: { isDefault: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) return false;

  const endsAt = user.subscriptionEndsAt;
  const stillInPeriod =
    endsAt != null && endsAt.getTime() > Date.now();

  if (user.subscriptionStatus === "ACTIVE" && stillInPeriod) {
    return true;
  }

  // Period ended while cancel was scheduled → move to CANCELED / NONE
  if (
    user.subscriptionStatus === "ACTIVE" &&
    user.cancelAtPeriodEnd &&
    endsAt &&
    !stillInPeriod
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "CANCELED",
        cancelAtPeriodEnd: false,
      },
    });
    return false;
  }

  // Auto-renew when period elapsed and not canceled
  if (
    (user.subscriptionStatus === "ACTIVE" ||
      user.subscriptionStatus === "PAST_DUE") &&
    endsAt &&
    !stillInPeriod &&
    !user.cancelAtPeriodEnd
  ) {
    const method = user.paymentMethods[0];
    if (!method) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: "PAST_DUE" },
      });
      return false;
    }

    const charge = await chargeCard({
      token: method.providerToken,
      description: "Deckva Pro — monthly renewal",
    });

    if (!charge.ok) {
      await prisma.$transaction([
        prisma.billingPayment.create({
          data: {
            userId,
            paymentMethodId: method.id,
            amount: STUDIO_PRO_PRICE,
            currency: STUDIO_PRO_CURRENCY,
            status: "FAILED",
            kind: "SUBSCRIPTION",
            description: "Pro renewal",
            failureReason: charge.error ?? "Payment failed",
            providerRef: charge.providerRef,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "PAST_DUE" },
        }),
      ]);
      return false;
    }

    const nextEnd = addBillingMonth(new Date());
    await prisma.$transaction([
      prisma.billingPayment.create({
        data: {
          userId,
          paymentMethodId: method.id,
          amount: STUDIO_PRO_PRICE,
          currency: STUDIO_PRO_CURRENCY,
          status: "SUCCEEDED",
          kind: "SUBSCRIPTION",
          description: "Pro renewal",
          providerRef: charge.providerRef,
          paidAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndsAt: nextEnd,
          cancelAtPeriodEnd: false,
        },
      }),
    ]);
    return true;
  }

  return isProStatus(user.subscriptionStatus, user.subscriptionEndsAt);
}

/** True if any OWNER of the org currently has Pro (used for invite joins). */
export async function orgOwnerHasPro(organizationId: string): Promise<boolean> {
  const owners = await prisma.organizationMember.findMany({
    where: { organizationId, role: "OWNER" },
    select: { userId: true },
  });
  for (const owner of owners) {
    if (await userHasPro(owner.userId)) return true;
  }
  return false;
}
