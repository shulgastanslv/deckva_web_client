import type { CardBrand, CardInput } from "@/lib/billing/types";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function detectCardBrand(number: string): CardBrand {
  const n = digitsOnly(number);
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^220[0-4]/.test(n)) return "mir";
  if (/^9112/.test(n)) return "belkart";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

function luhnOk(number: string) {
  const n = digitsOnly(number);
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateCardInput(input: CardInput): string | null {
  const number = digitsOnly(input.number);
  if (!luhnOk(number)) return "Invalid card number";

  const month = Number(input.expMonth);
  const year = Number(input.expYear);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return "Invalid expiry month";
  }
  const fullYear = year < 100 ? 2000 + year : year;
  const now = new Date();
  const exp = new Date(fullYear, month, 0, 23, 59, 59);
  if (exp < now) return "Card expired";

  const cvv = digitsOnly(input.cvv);
  const brand = detectCardBrand(number);
  const cvvLen = brand === "amex" ? 4 : 3;
  if (cvv.length !== cvvLen) return "Invalid CVV";

  return null;
}

export function normalizeExpiryYear(year: number) {
  return year < 100 ? 2000 + year : year;
}

export function formatCardBrand(brand: string) {
  switch (brand) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "mir":
      return "Mir";
    case "belkart":
      return "Belkart";
    case "amex":
      return "Amex";
    default:
      return "Card";
  }
}
