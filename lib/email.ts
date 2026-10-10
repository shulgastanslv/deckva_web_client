import dns from "node:dns/promises";

import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function appBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ).replace(/\/$/, "");
}

/** OS resolver. Nodemailer's own DNS query times out on some Windows DNS setups. */
async function resolveMailHost(hostname: string): Promise<string> {
  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: false });
    const ipv4 = records.find((record) => record.family === 4);
    return (ipv4 ?? records[0])?.address || hostname;
  } catch {
    return hostname;
  }
}

export async function sendAuthEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; reason: "unconfigured" | "failed" }> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const host = process.env.SMTP_HOST;

  if (!host || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] ${input.subject}\nTo: ${input.to}\n${input.text}`);
    }
    return { ok: false, reason: "unconfigured" };
  }

  try {
    const port = Number(process.env.SMTP_PORT || 587);
    const address = await resolveMailHost(host);
    const transport = nodemailer.createTransport({
      host: address,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      servername: host,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
      tls: { servername: host },
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });

    await transport.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { ok: true };
  } catch (err) {
    console.error("sendAuthEmail:", err);
    return { ok: false, reason: "failed" };
  }
}
