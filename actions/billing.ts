"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { formatCardBrand } from "@/lib/billing/card";
import { userHasPro } from "@/lib/billing/entitlements";
import { chargeCard, getPaymentProviderMode, tokenizeCard } from "@/lib/billing/provider";
import type {
  BillingPaymentDto,
  BillingSnapshot,
  CardInput,
  PaymentMethodDto,
} from "@/lib/billing/types";
import { prisma } from "@/lib/prisma";
import {
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
  addBillingMonth,
} from "@/lib/studio/plans";

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

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
  };
}

export async function getBilling(): Promise<
  ActionResult<{ billing: BillingSnapshot; providerMode: "bepaid" | "sandbox" }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    const billing = await buildSnapshot(userId);
    return {
      success: true,
      billing,
      providerMode: getPaymentProviderMode(),
    };
  } catch (err) {
    console.error("getBilling error:", err);
    return { success: false, error: "Couldn't load billing" };
  }
}

export async function attachPaymentCard(
  input: CardInput,
): Promise<ActionResult<{ billing: BillingSnapshot }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

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
          data: { bepaidCustomerId: tokenized.customerId },
        });
      }
    });

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("attachPaymentCard error:", err);
    const message =
      err instanceof Error ? err.message : "Couldn't save card";
    return { success: false, error: message };
  }
}

export async function detachPaymentCard(
  paymentMethodId?: string,
): Promise<ActionResult<{ billing: BillingSnapshot }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const method = await prisma.paymentMethod.findFirst({
      where: paymentMethodId
        ? { id: paymentMethodId, userId }
        : { userId, isDefault: true },
    });
    if (!method) return { success: false, error: "No card on file" };

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
        error: "Cancel your subscription before removing the card",
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
    return { success: false, error: "Couldn't remove card" };
  }
}

export async function subscribePro(): Promise<
  ActionResult<{ billing: BillingSnapshot }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    if (await userHasPro(userId)) {
      return { success: true, billing: await buildSnapshot(userId) };
    }

    const method = await prisma.paymentMethod.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: "desc" },
    });
    if (!method) {
      return { success: false, error: "Add a card before subscribing" };
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

    revalidatePath("/studio");
    revalidatePath("/studio/projects");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("subscribePro error:", err);
    return { success: false, error: "Couldn't start subscription" };
  }
}

export async function cancelSubscription(): Promise<
  ActionResult<{ billing: BillingSnapshot }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });
    if (!user || user.subscriptionStatus !== "ACTIVE") {
      return { success: false, error: "No active subscription" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: true },
    });

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("cancelSubscription error:", err);
    return { success: false, error: "Couldn't cancel subscription" };
  }
}

export async function resumeSubscription(): Promise<
  ActionResult<{ billing: BillingSnapshot }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

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
      return { success: false, error: "Nothing to resume" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: false },
    });

    revalidatePath("/studio");
    return { success: true, billing: await buildSnapshot(userId) };
  } catch (err) {
    console.error("resumeSubscription error:", err);
    return { success: false, error: "Couldn't resume subscription" };
  }
}
