"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

const MESSAGE_MIN = 4;
const MESSAGE_MAX = 4000;
const IMAGE_MAX = 4;
const IMAGE_BYTES_MAX = 2_000_000;

export type FeedbackItem = {
  id: string;
  message: string;
  images: string[];
  createdAt: string;
  userEmail: string;
  userName: string | null;
};

function isDataImage(value: string): boolean {
  return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}

function approxBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4);
}

export async function submitFeedback(input: {
  message: string;
  images?: string[];
}): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Sign in to send feedback" };

  const raw = Array.isArray(input.images) ? input.images : [];
  if (raw.length > IMAGE_MAX) {
    return { success: false, error: `Можно прикрепить до ${IMAGE_MAX} слайдов` };
  }

  const images: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || !isDataImage(item)) {
      return { success: false, error: "Только PNG, JPEG, WebP или GIF" };
    }
    if (approxBytes(item) > IMAGE_BYTES_MAX) {
      return { success: false, error: "Один из файлов слишком большой (макс. 2 МБ)" };
    }
    images.push(item);
  }

  let message = input.message.trim();
  if (!message && images.length > 0) {
    message = `Карусель · ${images.length} слайд${images.length === 1 ? "" : images.length < 5 ? "а" : "ов"}`;
  }
  if (message.length < MESSAGE_MIN) {
    return { success: false, error: "Добавьте карусель или короткий текст" };
  }
  if (message.length > MESSAGE_MAX) {
    return { success: false, error: "Сообщение слишком длинное" };
  }

  try {
    await prisma.feedback.create({
      data: { message, images, userId },
    });
    return { success: true };
  } catch (err) {
    console.error("submitFeedback:", err);
    return { success: false, error: "Couldn't save feedback" };
  }
}

export async function listFeedbacks(): Promise<
  { success: true; items: FeedbackItem[] } | { success: false; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const rows = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true, name: true } } },
    });
    return {
      success: true,
      items: rows.map((row) => ({
        id: row.id,
        message: row.message,
        images: row.images,
        createdAt: row.createdAt.toISOString(),
        userEmail: row.user.email,
        userName: row.user.name,
      })),
    };
  } catch (err) {
    console.error("listFeedbacks:", err);
    return { success: false, error: "Couldn't load feedback" };
  }
}
