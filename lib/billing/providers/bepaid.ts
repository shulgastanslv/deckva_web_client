import { isAxiosError } from "axios";

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
import { http } from "@/lib/api/http";
import {
  STUDIO_PRO_CURRENCY,
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

export function isBepaidConfigured() {
  return Boolean(
    process.env.BEPAID_SHOP_ID &&
      process.env.BEPAID_SECRET_KEY &&
      process.env.BEPAID_SHOP_ID !== "sandbox",
  );
}

export const bepaidProvider: PaymentProvider = {
  id: "bepaid",

  async tokenizeCard(input: CardInput): Promise<TokenizedCard> {
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
          tx?.message || data?.message || "Couldn't verify card",
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
      throw new Error("Couldn't verify card with payment provider");
    }
  },

  async chargeCard(params): Promise<ChargeResult> {
    try {
      const { data, status } = await http.post<BepaidPaymentResponse>(
        `${bepaidBaseUrl()}/beyag/payments`,
        {
          request: {
            amount: params.amount * 100,
            currency: params.currency,
            description: params.description,
            test: process.env.BEPAID_TEST === "true",
            credit_card: { token: params.token },
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
  },

  /**
   * bePaid notification template.
   * Wire signature check with BEPAID_SECRET_KEY when you enable live callbacks.
   * @see https://docs.bepaid.by/
   */
  async parseWebhook(
    request: Request,
    body: unknown,
  ): Promise<PaymentWebhookEvent | null> {
    // Placeholder: accept JSON notifications shaped like bePaid transactions.
    // Replace with HMAC / Basic auth verification before going live.
    const auth = request.headers.get("authorization");
    if (process.env.BEPAID_WEBHOOK_REQUIRE_AUTH === "true" && !auth) {
      return null;
    }

    if (!body || typeof body !== "object") return null;
    const row = body as Record<string, unknown>;
    const tx =
      row.transaction && typeof row.transaction === "object"
        ? (row.transaction as Record<string, unknown>)
        : row;

    const statusRaw = String(tx.status ?? row.status ?? "").toLowerCase();
    let type: PaymentWebhookEvent["type"] = "unknown";
    if (statusRaw === "successful" || statusRaw === "success") {
      type = "payment.succeeded";
    } else if (statusRaw === "failed" || statusRaw === "declined") {
      type = "payment.failed";
    }

    return {
      type,
      providerRef:
        typeof tx.uid === "string"
          ? tx.uid
          : typeof row.uid === "string"
            ? row.uid
            : undefined,
      amount:
        typeof tx.amount === "number"
          ? Math.round(tx.amount / 100)
          : undefined,
      currency:
        typeof tx.currency === "string"
          ? tx.currency
          : typeof row.currency === "string"
            ? row.currency
            : undefined,
      raw: body,
    };
  },
};
