"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { revalidatePath } from "next/cache";

import { formatCardBrand } from "@/lib/billing/card";
import { grantPlanCredits, grantTopupCredits } from "@/lib/billing/credits";
import { userHasPro } from "@/lib/billing/entitlements";
import { getGenerationEntitlement } from "@/lib/billing/generations";
import { chargeCard, getPaymentProviderMode, tokenizeCard } from "@/lib/billing/provider";
import type {
  BillingPaymentDto,
  BillingSnapshot,
  CardInput,
  PaymentMethodDto,
  PaymentProviderId,
} from "@/lib/billing/types";
import { prisma } from "@/lib/prisma";
import {
  CREDIT_PACK_CREDITS,
  CREDIT_PACK_PRICE,
  FREE_GENERATION_LIMIT,
  PRO_MONTHLY_CREDITS,
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
  addBillingMonth,
} from "@/lib/studio/plans";

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };


function mapMethod(m: {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: Date;
}): PaymentMethodDto {
  return {
    id: m.id,
    brand: m.brand,
    last4: m.last4,
    expMonth: m.expMonth,
    expYear: m.expYear,
    isDefault: m.isDefault,
    createdAt: m.createdAt.toISOString(),
  };
}

function mapPayment(p: {
  id: string;
  amount: number;
  currency: string;
  status: BillingPaymentDto["status"];
  kind: BillingPaymentDto["kind"];
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
  paymentMethod: { last4: string; brand: string } | null;
}): BillingPaymentDto {
  return {
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    kind: p.kind,
    description: p.description,
    paidAt: p.paidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    cardLast4: p.paymentMethod?.last4 ?? null,
    cardBrand: p.paymentMethod?.brand
      ? formatCardBrand(p.paymentMethod.brand)
      : null,
  };
}

async function buildSnapshot(userId: string): Promise<BillingSnapshot> {
  await userHasPro(userId);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      cancelAtPeriodEnd: true,
      paymentMethods: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
      billingPayments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          paymentMethod: { select: { last4: true, brand: true } },
        },
      },
    },
  });

  const isPro = await userHasPro(userId);
  const gens = await getGenerationEntitlement(userId);
  const credits = gens.credits ?? { plan: 0, topup: 0, total: 0 };

  return {
    isPro,
    status: user.subscriptionStatus,
    subscriptionEndsAt: user.subscriptionEndsAt?.toISOString() ?? null,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    price: STUDIO_PRO_PRICE,
    currency: STUDIO_PRO_CURRENCY,
    paymentMethod: user.paymentMethods[0]
      ? mapMethod(user.paymentMethods[0])
      : null,
    payments: user.billingPayments.map(mapPayment),
    freeGenerationsUsed: gens.isPro ? 0 : gens.used,
    freeGenerationsLimit: FREE_GENERATION_LIMIT,
    freeGenerationsRemaining: gens.isPro ? 0 : gens.remaining,
    creditsPlan: credits.plan,
    creditsTopup: credits.topup,
    creditsTotal: credits.total,
    creditPackPrice: CREDIT_PACK_PRICE,
    creditPackCredits: CREDIT_PACK_CREDITS,
    proMonthlyCredits: PRO_MONTHLY_CREDITS,
  };
}

export async function getBilling(): Promise<
  ActionResult<{ billing: BillingSnapshot; providerMode: PaymentProviderId }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const billing = await buildSnapshot(userId);
    return {
      success: true,
      billing,
      providerMode: getPaymentProviderMode(),
    };
  } catch (err) {
    console.error("getBilling error:", err);
    return { success: false, error: messages.errors.loadBilling };
  }
}

export async function attachPaymentCard(
  input: CardInput,
): Promise<ActionResult<{ billing: BillingSnapshot }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const tokenized = await tokenizeCard(input);

    await prisma.$transaction(async (tx) => {
      await tx.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
      await tx.paymentMethod.create({
        data: {
          userId,
          brand: tokenized.brand,
          last4: tokenized.last4,
          expMonth: tokenized.expMonth,
          expYear: tokenized.expYear,
          providerToken: tokenized.token,
          providerCustomer: tokenized.customerId,
          isDefault: true,
        },
      });
      if (tokenized.customerId) {
        await tx.user.update({
          where: { id: userId },
          data: { paymentCustomerId: tokenized.customerId },
        });
      }
    });

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("attachPaymentCard error:", err);
    const message =
      err instanceof Error ? err.message : messages.errors.saveCard;
    return { success: false, error: message };
  }
}

export async function detachPaymentCard(
  paymentMethodId?: string,
): Promise<ActionResult<{ billing: BillingSnapshot }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const method = await prisma.paymentMethod.findFirst({
      where: paymentMethodId
        ? { id: paymentMethodId, userId }
        : { userId, isDefault: true },
    });
    if (!method) return { success: false, error: messages.errors.noCard };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        cancelAtPeriodEnd: true,
        subscriptionEndsAt: true,
      },
    });

    if (
      user &&
      user.subscriptionStatus === "ACTIVE" &&
      !user.cancelAtPeriodEnd &&
      user.subscriptionEndsAt &&
      user.subscriptionEndsAt.getTime() > Date.now()
    ) {
      return {
        success: false,
        error: messages.errors.cancelBeforeRemoveCard,
      };
    }

    await prisma.paymentMethod.delete({ where: { id: method.id } });

    const next = await prisma.paymentMethod.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.paymentMethod.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("detachPaymentCard error:", err);
    return { success: false, error: messages.errors.removeCard };
  }
}

export async function subscribePro(): Promise<
  ActionResult<{ billing: BillingSnapshot }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    if (await userHasPro(userId)) {
      return { success: true, billing: await buildSnapshot(userId) };
    }

    const method = await prisma.paymentMethod.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: "desc" },
    });
    if (!method) {
      return { success: false, error: messages.errors.addCardBeforeSubscribe };
    }

    const charge = await chargeCard({
      token: method.providerToken,
      description: "Deckva Pro — first month",
    });

    if (!charge.ok) {
      await prisma.billingPayment.create({
        data: {
          userId,
          paymentMethodId: method.id,
          amount: STUDIO_PRO_PRICE,
          currency: STUDIO_PRO_CURRENCY,
          status: "FAILED",
          kind: "SUBSCRIPTION",
          description: "Pro subscription",
          failureReason: charge.error ?? "Payment failed",
          providerRef: charge.providerRef,
        },
      });
      return {
        success: false,
        error: charge.error ?? "Payment declined",
      };
    }

    const endsAt = addBillingMonth(new Date());

    await prisma.$transaction([
      prisma.billingPayment.create({
        data: {
          userId,
          paymentMethodId: method.id,
          amount: STUDIO_PRO_PRICE,
          currency: STUDIO_PRO_CURRENCY,
          status: "SUCCEEDED",
          kind: "SUBSCRIPTION",
          description: "Pro subscription",
          providerRef: charge.providerRef,
          paidAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndsAt: endsAt,
          cancelAtPeriodEnd: false,
        },
      }),
    ]);

    await grantPlanCredits(userId, undefined, { reason: "pro_subscribe" });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("subscribePro error:", err);
    return { success: false, error: messages.errors.startSubscription };
  }
}

export async function purchaseCredits(): Promise<
  ActionResult<{ billing: BillingSnapshot }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    if (!(await userHasPro(userId))) {
      return { success: false, error: messages.errors.proRequiredForCredits };
    }

    const method = await prisma.paymentMethod.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: "desc" },
    });
    if (!method) {
      return { success: false, error: messages.errors.addCardBeforeCredits };
    }

    const charge = await chargeCard({
      token: method.providerToken,
      amount: CREDIT_PACK_PRICE,
      currency: STUDIO_PRO_CURRENCY,
      description: `Deckva — ${CREDIT_PACK_CREDITS} generation credits`,
    });

    if (!charge.ok) {
      await prisma.billingPayment.create({
        data: {
          userId,
          paymentMethodId: method.id,
          amount: CREDIT_PACK_PRICE,
          currency: STUDIO_PRO_CURRENCY,
          status: "FAILED",
          kind: "CREDITS",
          description: `${CREDIT_PACK_CREDITS} credits`,
          failureReason: charge.error ?? "Payment failed",
          providerRef: charge.providerRef,
        },
      });
      return {
        success: false,
        error: charge.error ?? "Payment declined",
      };
    }

    await prisma.billingPayment.create({
      data: {
        userId,
        paymentMethodId: method.id,
        amount: CREDIT_PACK_PRICE,
        currency: STUDIO_PRO_CURRENCY,
        status: "SUCCEEDED",
        kind: "CREDITS",
        description: `${CREDIT_PACK_CREDITS} credits`,
        providerRef: charge.providerRef,
        paidAt: new Date(),
      },
    });

    await grantTopupCredits(userId, CREDIT_PACK_CREDITS, {
      paymentRef: charge.providerRef,
    });

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("purchaseCredits error:", err);
    return { success: false, error: messages.errors.purchaseCredits };
  }
}

export async function cancelSubscription(): Promise<
  ActionResult<{ billing: BillingSnapshot }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });
    if (!user || user.subscriptionStatus !== "ACTIVE") {
      return { success: false, error: messages.errors.noActiveSubscription };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: true },
    });

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("cancelSubscription error:", err);
    return { success: false, error: messages.errors.cancelSubscription };
  }
}

export async function resumeSubscription(): Promise<
  ActionResult<{ billing: BillingSnapshot }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        cancelAtPeriodEnd: true,
        subscriptionEndsAt: true,
      },
    });
    if (
      !user ||
      user.subscriptionStatus !== "ACTIVE" ||
      !user.cancelAtPeriodEnd
    ) {
      return { success: false, error: messages.errors.nothingToResume };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: false },
    });

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("resumeSubscription error:", err);
    return { success: false, error: messages.errors.resumeSubscription };
  }
}
