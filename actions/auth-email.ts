"use server";

import { messages } from "@/lib/messages";
import bcrypt from "bcryptjs";

import { isPasswordLongEnough } from "@/lib/auth/password";
import {
  AuthTokenType,
  consumeAuthToken,
  issueAuthToken,
} from "@/lib/auth-tokens";
import {
  appBaseUrl,
  authEmailHtml,
  isValidEmail,
  normalizeEmail,
  sendAuthEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

function mailFailure(reason: "unconfigured" | "failed"): string {
  if (reason === "unconfigured") return messages.errors.emailNotConfigured;
  return messages.errors.sendEmail;
}

async function sendLinkEmail(input: {
  to: string;
  subject: string;
  title: string;
  body: string;
  action: string;
  url: string;
}): Promise<{ ok: true } | { ok: false; reason: "unconfigured" | "failed" }> {
  return sendAuthEmail({
    to: input.to,
    subject: input.subject,
    text: `${input.title}\n\n${input.body}\n\n${input.action}: ${input.url}\n\nIf you didn’t ask for this, you can ignore this email.`,
    html: authEmailHtml({
      title: input.title,
      body: input.body,
      actionLabel: input.action,
      url: input.url,
    }),
  });
}

export async function sendVerificationEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return { error: messages.errors.validEmail };

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || !user.password || user.emailVerified) {
    return { success: true as const, delivered: true };
  }

  const token = await issueAuthToken(normalized, AuthTokenType.verify, user.id);
  const url = `${appBaseUrl()}/?verify=${token}`;
  const sent = await sendLinkEmail({
    to: normalized,
    subject: "Confirm your Deckva email",
    title: "Confirm your email",
    body: "Thanks for signing up. Tap the button below to confirm your email and finish creating your account.",
    action: "Confirm email",
    url,
  });

  if (sent.ok === false) {
    return { error: mailFailure(sent.reason) };
  }

  return { success: true as const, delivered: true };
}

export async function verifyEmail(token: string) {
  const consumed = await consumeAuthToken(token, AuthTokenType.verify);
  if (!consumed) return { error: messages.errors.linkExpired };

  await prisma.user.update({
    where: { email: consumed.email },
    data: { emailVerified: new Date() },
  });

  return { success: true as const };
}

export async function requestPasswordReset(email: string) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return { error: messages.errors.validEmail };

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (user) {
    const token = await issueAuthToken(normalized, AuthTokenType.reset, user.id);
    const url = `${appBaseUrl()}/?reset=${token}`;
    const sent = await sendLinkEmail({
      to: normalized,
      subject: "Reset your Deckva password",
      title: "Reset your password",
      body: "We got a request to reset your password. The link expires in one hour.",
      action: "Choose a new password",
      url,
    });

    if (sent.ok === false) {
      return { error: mailFailure(sent.reason) };
    }
  }

  return { success: true as const, delivered: true };
}

export async function resetPassword(token: string, password: string) {
  if (!password || !isPasswordLongEnough(password)) {
    return { error: messages.errors.passwordTooShort };
  }

  const consumed = await consumeAuthToken(token, AuthTokenType.reset);
  if (!consumed) return { error: messages.errors.linkExpired };

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: consumed.email },
    data: { password: hashedPassword, emailVerified: new Date() },
  });

  return { success: true as const };
}

export async function checkCredentials(email: string, password: string) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !password) {
    return { error: messages.errors.incorrectCredentials };
  }

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return { error: messages.errors.incorrectCredentials };
  if (!user.password) {
    return { error: messages.errors.useGoogleSignIn, code: "google" as const };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: messages.errors.incorrectCredentials };
  if (!user.emailVerified) {
    return { error: messages.errors.confirmEmail, code: "unverified" as const };
  }

  return { ok: true as const };
}
