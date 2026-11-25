"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

type ProfileResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

export async function getProfile(): Promise<
  ProfileResult<{
    name: string | null;
    email: string;
    image: string | null;
  }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
      },
    });
    if (!user) return { success: false, error: messages.errors.accountNotFound };

    return {
      success: true,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  } catch (err) {
    console.error("getProfile error:", err);
    return { success: false, error: messages.errors.loadProfile };
  }
}

export async function updateProfile(input: {
  name?: string;
  image?: string | null;
}): Promise<ProfileResult<{ name: string | null; image: string | null }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true },
    });
    if (!user) return { success: false, error: messages.errors.accountNotFound };

    const data: { name?: string; image?: string | null } = {};

    if (typeof input.name === "string") {
      const name = input.name.trim();
      if (!name) return { success: false, error: messages.errors.enterName };
      if (name.length > 80) return { success: false, error: messages.errors.nameTooLong };
      data.name = name;
    }

    if (input.image === null) {
      data.image = null;
    } else if (typeof input.image === "string") {
      const image = input.image.trim();
      const isRemote = /^https?:\/\//i.test(image);
      const isData = /^data:image\/(png|jpe?g|webp);base64,/i.test(image);
      if (!isRemote && !isData) {
        return { success: false, error: messages.errors.readAvatar };
      }
      if (isData && image.length > 450_000) {
        return { success: false, error: messages.errors.assetTooLarge };
      }
      data.image = image;
    }

    if (Object.keys(data).length === 0) {
      return { success: false, error: messages.errors.nothingToUpdate };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { name: true, image: true },
    });

    return { success: true, name: updated.name, image: updated.image };
  } catch (err) {
    console.error("updateProfile error:", err);
    return { success: false, error: messages.errors.updateProfile };
  }
}

export async function deleteAccount(input: {
  confirm: string;
}): Promise<ProfileResult> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    if (input.confirm.trim().toUpperCase() !== "DELETE") {
      return { success: false, error: "Type DELETE to confirm" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) return { success: false, error: messages.errors.accountNotFound };

    await prisma.user.delete({ where: { id: user.id } });
    return { success: true };
  } catch (err) {
    console.error("deleteAccount error:", err);
    return { success: false, error: messages.errors.deleteAccount };
  }
}
