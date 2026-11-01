"use server"

import { messages } from "@/lib/messages";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { sendVerificationEmail } from "@/actions/auth-email";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

interface RegisterInput {
  name: string;
  email: string;
  password?: string;
}

type ProfileResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

export async function getProfile(): Promise<
  ProfileResult<{
    name: string | null;
    email: string;
    image: string | null;
    hasPassword: boolean;
    emailVerified: string | null;
    createdAt: string;
  }>
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        password: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    if (!user) return { success: false, error: messages.errors.accountNotFound };

    return {
      success: true,
      name: user.name,
      email: user.email,
      image: user.image,
      hasPassword: Boolean(user.password),
      emailVerified: user.emailVerified?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (err) {
    console.error("getProfile error:", err);
    return { success: false, error: messages.errors.loadProfile };
  }
}

export async function updateProfile(input: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<ProfileResult<{ name: string | null }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, password: true },
    });
    if (!user) return { success: false, error: messages.errors.accountNotFound };

    const data: { name?: string; password?: string } = {};

    if (typeof input.name === "string") {
      const name = input.name.trim();
      if (!name) return { success: false, error: messages.errors.enterName };
      if (name.length > 80) return { success: false, error: messages.errors.nameTooLong };
      data.name = name;
    }

    const wantsPassword =
      Boolean(input.newPassword?.trim()) || Boolean(input.currentPassword?.trim());
    if (wantsPassword) {
      const next = input.newPassword?.trim() ?? "";
      if (next.length < 6) {
        return { success: false, error: messages.errors.passwordTooShort };
      }
      if (user.password) {
        const current = input.currentPassword ?? "";
        if (!current) {
          return { success: false, error: messages.errors.currentPassword };
        }
        const ok = await bcrypt.compare(current, user.password);
        if (!ok) return { success: false, error: messages.errors.currentPasswordIncorrect };
      }
      data.password = await bcrypt.hash(next, 10);
    }

    if (Object.keys(data).length === 0) {
      return { success: false, error: messages.errors.nothingToUpdate };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { name: true },
    });

    return { success: true, name: updated.name };
  } catch (err) {
    console.error("updateProfile error:", err);
    return { success: false, error: messages.errors.updateProfile };
  }
}

export async function deleteAccount(input: {
  confirm: string;
  password?: string;
}): Promise<ProfileResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: messages.errors.signIn };

    if (input.confirm.trim().toUpperCase() !== "DELETE") {
      return { success: false, error: 'Type DELETE to confirm' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });
    if (!user) return { success: false, error: messages.errors.accountNotFound };

    if (user.password) {
      const password = input.password ?? "";
      if (!password) {
        return { success: false, error: messages.errors.enterPassword };
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return { success: false, error: messages.errors.passwordIncorrect };
    }

    await prisma.user.delete({ where: { id: user.id } });
    return { success: true };
  } catch (err) {
    console.error("deleteAccount error:", err);
    return { success: false, error: messages.errors.deleteAccount };
  }
}

export async function registerUser({ name, email, password }: RegisterInput) {
  try {
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized) || !password) {
      return { error: messages.errors.validEmailAndPassword };
    }

    if (password.length < 6) {
      return { error: messages.errors.passwordTooShort };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (existingUser) {
      return { error: messages.errors.accountExists };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email: normalized,
        password: hashedPassword,
      },
    });

    const mailed = await sendVerificationEmail(normalized);
    if ("error" in mailed && mailed.error) {
      return {
        success: true as const,
        needsVerification: true as const,
        delivered: false,
        error: mailed.error,
      };
    }

    return {
      success: true as const,
      needsVerification: true as const,
      delivered: "delivered" in mailed ? mailed.delivered : false,
    };
  } catch (err) {
    console.error("Register user error:", err);
    return { error: messages.errors.serverError };
  }
}
