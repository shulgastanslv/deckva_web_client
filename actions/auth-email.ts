"use server";

import { messages } from "@/lib/messages";
import bcrypt from "bcryptjs";

import { isPasswordLongEnough } from "@/lib/auth/password";
import {
  AuthTokenType,
  consumeAuthToken,
  issueAuthToken,
} from "@/lib/auth-tokens";
import { appBaseUrl, isValidEmail, normalizeEmail, sendAuthEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function mailFailure(reason: "unconfigured" | "failed"): string | null {
  if (reason === "unconfigured" && process.env.NODE_ENV !== "production") return null;
  if (reason === "unconfigured") return messages.errors.emailNotConfigured;
  return messages.errors.sendEmail;
}

async function sendLinkEmail(input: {
  to: string;
  subject: string;
  intro: string;
  url: string;
  action: string;
}): Promise<{ ok: true } | { ok: false; reason: "unconfigured" | "failed" }> {
  return sendAuthEmail({
    to: input.to,
    subject: input.subject,
    text: `${input.intro}\n\n${input.url}\n\nIf you didn't ask for this, you can ignore this email.`,
    html: `<p>${input.intro}</p><p><a href="${input.url}">${input.action}</a></p><p>If you didn't ask for this, you can ignore this email.</p>`,
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
    subject: "Confirm your email",
    intro: "Confirm your email to finish creating your account.",
    url,
    action: "Confirm email",
  });

  if (sent.ok === false) {
    const error = mailFailure(sent.reason);
    if (error) return { error };
    return { success: true as const, delivered: false };
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
      subject: "Reset your password",
      intro: "Use this link to choose a new password. It expires in one hour.",
      url,
      action: "Reset password",
    });

    if (sent.ok === false) {
      const error = mailFailure(sent.reason);
      if (error) return { error };
      return { success: true as const, delivered: false };
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
  if (!user?.password) return { error: messages.errors.incorrectCredentials };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: messages.errors.incorrectCredentials };
  if (!user.emailVerified) {
    return { error: messages.errors.confirmEmail, code: "unverified" as const };
  }

  return { ok: true as const };
}
