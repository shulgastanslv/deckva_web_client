import { createHash, randomBytes } from "crypto";
import { isAxiosError } from "axios";

import {
  detectCardBrand,
  digitsOnly,
  normalizeExpiryYear,
  validateCardInput,
} from "@/lib/billing/card";
import type { CardInput, ChargeResult, TokenizedCard } from "@/lib/billing/types";
import { http } from "@/lib/api/http";
import {
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
} from "@/lib/studio/plans";

type BepaidPaymentResponse = {
  transaction?: {
    status?: string;
    uid?: string;
    credit_card?: {
      token?: string;
      brand?: string;
      last_4?: string;
      exp_month?: number | string;
      exp_year?: number | string;
    };
    message?: string;
  };
  message?: string;
};

function bepaidBaseUrl() {
  return (
    process.env.BEPAID_API_URL?.replace(/\/$/, "") || "https://gateway.bepaid.by"
  );
}

function bepaidAuthHeader() {
  const shopId = process.env.BEPAID_SHOP_ID!;
  const secret = process.env.BEPAID_SECRET_KEY!;
  return `Basic ${Buffer.from(`${shopId}:${secret}`).toString("base64")}`;
}

function bepaidConfigured() {
  return Boolean(
    process.env.BEPAID_SHOP_ID &&
      process.env.BEPAID_SECRET_KEY &&
      process.env.BEPAID_SHOP_ID !== "sandbox",
  );
}

function sandboxToken(cardNumber: string, expMonth: number, expYear: number) {
  const raw = `${digitsOnly(cardNumber)}:${expMonth}:${expYear}:${randomBytes(8).toString("hex")}`;
  return `sandbox_${createHash("sha256").update(raw).digest("hex").slice(0, 32)}`;
}

async function tokenizeSandbox(input: CardInput): Promise<TokenizedCard> {
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
}

async function chargeSandbox(
  token: string,
  amount: number,
  currency: string,
): Promise<ChargeResult> {
  if (!token.startsWith("sandbox_")) {
    return { ok: false, error: "Unknown payment method" };
  }
  // Simulate decline for cards ending with 0000 in token material is not available —
  // always succeed in sandbox except zero amount.
  if (amount <= 0) return { ok: false, error: "Invalid amount" };
  return {
    ok: true,
    providerRef: `sandbox_pay_${randomBytes(10).toString("hex")}_${currency}${amount}`,
  };
}

/**
 * bePaid card tokenization via payment API.
 * Requires BEPAID_SHOP_ID + BEPAID_SECRET_KEY. Falls back to sandbox when unset.
 * @see https://docs.bepaid.by/
 */
async function tokenizeBepaid(input: CardInput): Promise<TokenizedCard> {
  const err = validateCardInput(input);
  if (err) throw new Error(err);

  const number = digitsOnly(input.number);
  const expYear = normalizeExpiryYear(input.expYear);

  try {
    const { data, status } = await http.post<BepaidPaymentResponse>(
      `${bepaidBaseUrl()}/beyag/payments`,
      {
        request: {
          amount: 100,
          currency: STUDIO_PRO_CURRENCY,
          description: "Card verification",
          test: process.env.BEPAID_TEST === "true",
          credit_card: {
            number,
            verification_value: digitsOnly(input.cvv),
            holder: input.holder?.trim() || "CARD HOLDER",
            exp_month: String(input.expMonth).padStart(2, "0"),
            exp_year: String(expYear),
          },
          additional_data: {
            contract: ["recurring"],
          },
        },
      },
      {
        headers: {
          Authorization: bepaidAuthHeader(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        validateStatus: () => true,
      },
    );

    const tx = data?.transaction;
    const token = tx?.credit_card?.token;
    if (status < 200 || status >= 300 || !token) {
      throw new Error(
        tx?.message || data?.message || "Couldn't verify card with bePaid",
      );
    }

    return {
      token,
      brand: detectCardBrand(number),
      last4: tx?.credit_card?.last_4 || number.slice(-4),
      expMonth: Number(tx?.credit_card?.exp_month) || input.expMonth,
      expYear: Number(tx?.credit_card?.exp_year) || expYear,
      customerId: tx?.uid,
    };
  } catch (error) {
    if (error instanceof Error && !isAxiosError(error)) throw error;
    throw new Error("Couldn't verify card with bePaid");
  }
}

async function chargeBepaid(
  token: string,
  amount: number,
  currency: string,
  description: string,
): Promise<ChargeResult> {
  try {
    const { data, status } = await http.post<BepaidPaymentResponse>(
      `${bepaidBaseUrl()}/beyag/payments`,
      {
        request: {
          amount: amount * 100,
          currency,
          description,
          test: process.env.BEPAID_TEST === "true",
          credit_card: { token },
        },
      },
      {
        headers: {
          Authorization: bepaidAuthHeader(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        validateStatus: () => true,
      },
    );

    const txStatus = data?.transaction?.status;
    if (
      status < 200 ||
      status >= 300 ||
      (txStatus && txStatus !== "successful" && txStatus !== "success")
    ) {
      return {
        ok: false,
        error: data?.transaction?.message || data?.message || "Payment declined",
      };
    }

    return { ok: true, providerRef: data?.transaction?.uid };
  } catch {
    return { ok: false, error: "Payment declined" };
  }
}

export function getPaymentProviderMode(): "bepaid" | "sandbox" {
  return bepaidConfigured() ? "bepaid" : "sandbox";
}

export async function tokenizeCard(input: CardInput): Promise<TokenizedCard> {
  if (bepaidConfigured()) return tokenizeBepaid(input);
  return tokenizeSandbox(input);
}

export async function chargeCard(params: {
  token: string;
  amount?: number;
  currency?: string;
  description?: string;
}): Promise<ChargeResult> {
  const amount = params.amount ?? STUDIO_PRO_PRICE;
  const currency = params.currency ?? STUDIO_PRO_CURRENCY;
  const description = params.description ?? "Deckva Pro";

  if (bepaidConfigured() && !params.token.startsWith("sandbox_")) {
    return chargeBepaid(params.token, amount, currency, description);
  }
  return chargeSandbox(params.token, amount, currency);
}
