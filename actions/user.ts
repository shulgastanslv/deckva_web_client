"use server"

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
  ProfileResult<{ name: string | null; email: string; hasPassword: boolean }>
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Sign in" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, password: true },
    });
    if (!user) return { success: false, error: "Account not found" };

    return {
      success: true,
      name: user.name,
      email: user.email,
      hasPassword: Boolean(user.password),
    };
  } catch (err) {
    console.error("getProfile error:", err);
    return { success: false, error: "Couldn't load profile" };
  }
}

export async function updateProfile(input: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<ProfileResult<{ name: string | null }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Sign in" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, password: true },
    });
    if (!user) return { success: false, error: "Account not found" };

    const data: { name?: string; password?: string } = {};

    if (typeof input.name === "string") {
      const name = input.name.trim();
      if (!name) return { success: false, error: "Enter a name" };
      if (name.length > 80) return { success: false, error: "Name is too long" };
      data.name = name;
    }

    const wantsPassword =
      Boolean(input.newPassword?.trim()) || Boolean(input.currentPassword?.trim());
    if (wantsPassword) {
      const next = input.newPassword?.trim() ?? "";
      if (next.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
      }
      if (user.password) {
        const current = input.currentPassword ?? "";
        if (!current) {
          return { success: false, error: "Enter your current password" };
        }
        const ok = await bcrypt.compare(current, user.password);
        if (!ok) return { success: false, error: "Current password is incorrect" };
      }
      data.password = await bcrypt.hash(next, 10);
    }

    if (Object.keys(data).length === 0) {
      return { success: false, error: "Nothing to update" };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { name: true },
    });

    return { success: true, name: updated.name };
  } catch (err) {
    console.error("updateProfile error:", err);
    return { success: false, error: "Couldn't update profile" };
  }
}

export async function registerUser({ name, email, password }: RegisterInput) {
  try {
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized) || !password) {
      return { error: "Enter a valid email and a password" };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
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
    return { error: "Something went wrong on the server" };
  }
}
