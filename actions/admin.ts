"use server";

import bcrypt from "bcryptjs";

import { requireUserId } from "@/lib/auth/session";
import { isPasswordLongEnough } from "@/lib/auth/password";
import { emailIsAdmin } from "@/lib/auth-role";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { messages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/roles";
import { promotePlatformAdmin } from "@/lib/studio/admin-unlimited";

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorName: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  read: boolean;
}

async function requireAdminId(): Promise<string | null> {
  const userId = await requireUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) return null;
  if (isPlatformAdmin(user.role) || emailIsAdmin(user.email)) {
    await promotePlatformAdmin(user.id);
    return user.id;
  }
  return null;
}


export async function listPublishedNews(): Promise<ActionResult<{ news: NewsItem[] }>> {
  try {
    const rows = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: { name: true, email: true } } },
    });
    return {
      success: true,
      news: rows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
        authorName: row.author.name || row.author.email,
      })),
    };
  } catch (err) {
    console.error("listPublishedNews error:", err);
    return { success: false, error: messages.errors.loadNews };
  }
}

export async function listNews(): Promise<ActionResult<{ news: NewsItem[] }>> {
  try {
    if (!(await requireAdminId())) return { success: false, error: messages.errors.adminsOnly };
    const rows = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { author: { select: { name: true, email: true } } },
    });
    return {
      success: true,
      news: rows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
        authorName: row.author.name || row.author.email,
      })),
    };
  } catch (err) {
    console.error("listNews error:", err);
    return { success: false, error: messages.errors.loadNews };
  }
}

async function notifyEveryone(title: string, body: string, newsId?: string) {
  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) return;
  await prisma.notification.createMany({
    data: users.map((user) => ({
      title,
      body,
      userId: user.id,
      newsId: newsId ?? null,
    })),
  });
}

export async function publishNews(input: {
  title: string;
  body: string;
}): Promise<ActionResult<{ newsId: string }>> {
  try {
    const authorId = await requireAdminId();
    if (!authorId) return { success: false, error: messages.errors.adminsOnly };
    const title = input.title.trim();
    const body = input.body.trim();
    if (!title || !body) return { success: false, error: messages.errors.titleAndTextRequired };

    const news = await prisma.news.create({
      data: { title, body, authorId },
      select: { id: true },
    });
    await notifyEveryone(title, body, news.id);
    return { success: true, newsId: news.id };
  } catch (err) {
    console.error("publishNews error:", err);
    return { success: false, error: messages.errors.publishNews };
  }
}

export async function sendNotification(input: {
  title: string;
  body: string;
}): Promise<ActionResult<object>> {
  try {
    if (!(await requireAdminId())) return { success: false, error: messages.errors.adminsOnly };
    const title = input.title.trim();
    const body = input.body.trim();
    if (!title || !body) return { success: false, error: messages.errors.titleAndTextRequired };
    await notifyEveryone(title, body);
    return { success: true };
  } catch (err) {
    console.error("sendNotification error:", err);
    return { success: false, error: messages.errors.sendNotification };
  }
}

/** Project lifecycle inbox noise (created / ready / copy / import) — hidden + pruned. */
const PROJECT_NOISE_TITLES = new Set([
  "Project created",
  "Carousel ready",
  "Copy created",
  "Import complete",
  "Проект создан",
  "Карусель готова",
  "Копия создана",
  "Импорт завершён",
  "Праект створаны",
  "Карусель гатовая",
  "Копія створана",
  "Імпарт завершаны",
]);

export async function listMyNotifications(input?: {
  cursor?: string | null;
  take?: number;
}): Promise<
  ActionResult<{
    items: NotificationItem[];
    unread: number;
    nextCursor: string | null;
  }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    await prisma.notification.deleteMany({
      where: {
        userId,
        newsId: null,
        title: { in: [...PROJECT_NOISE_TITLES] },
      },
    });

    const noiseTitles = [...PROJECT_NOISE_TITLES];
    const where = {
      userId,
      NOT: { title: { in: noiseTitles } },
    };

    const take = Math.min(40, Math.max(10, Math.round(input?.take ?? 20)));
    const cursor = input?.cursor?.trim() || null;

    const [rows, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip: 1,
            }
          : {}),
      }),
      prisma.notification.count({
        where: { ...where, readAt: null },
      }),
    ]);

    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    const items = page.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      href: row.href ?? null,
      createdAt: row.createdAt.toISOString(),
      read: row.readAt != null,
    }));
    return {
      success: true,
      items,
      unread,
      nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
    };
  } catch (err) {
    console.error("listMyNotifications error:", err);
    return { success: false, error: messages.errors.loadNotifications };
  }
}

export async function deleteNotification(id: string): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    
    await prisma.notification.delete({
      where: { id, userId }, // userId гарантирует, что удаляется только свое уведомление
    });
    return { success: true };
  } catch (err) {
    console.error("deleteNotification error:", err);
    return { success: false, error: "Не удалось удалить уведомление" };
  }
}

export async function toggleNotificationRead(id: string, read: boolean): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    
    await prisma.notification.update({
      where: { id, userId },
      data: { readAt: read ? new Date() : null },
    });
    return { success: true };
  } catch (err) {
    console.error("toggleNotificationRead error:", err);
    return { success: false, error: "Не удалось обновить статус уведомления" };
  }
}

export async function markNotificationsRead(): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  } catch (err) {
    console.error("markNotificationsRead error:", err);
    return { success: false, error: messages.errors.updateNotifications };
  }
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  unlimitedGenerations: boolean;
  generationsUsedToday: number;
  banned: boolean;
  createdAt: string;
}

export async function listUsers(): Promise<
  ActionResult<{ users: AdminUserRow[] }>
> {
  try {
    if (!(await requireAdminId())) {
      return { success: false, error: messages.errors.adminsOnly };
    }
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        unlimitedGenerations: true,
        generationsUsedToday: true,
        bannedAt: true,
        createdAt: true,
      },
    });
    return {
      success: true,
      users: rows.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        unlimitedGenerations: row.unlimitedGenerations,
        generationsUsedToday: row.generationsUsedToday,
        banned: row.bannedAt != null,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("listUsers error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function updateUserFlags(input: {
  userId: string;
  role?: "USER" | "ADMIN";
  unlimitedGenerations?: boolean;
  banned?: boolean;
}): Promise<ActionResult<object>> {
  try {
    const adminId = await requireAdminId();
    if (!adminId) return { success: false, error: messages.errors.adminsOnly };
    if (!input.userId.trim()) {
      return { success: false, error: messages.errors.generic };
    }
    if (input.userId === adminId && input.role === "USER") {
      return { success: false, error: messages.errors.generic };
    }
    if (input.userId === adminId && input.banned === true) {
      return { success: false, error: messages.errors.generic };
    }

    const data: {
      role?: "USER" | "ADMIN";
      unlimitedGenerations?: boolean;
      bannedAt?: Date | null;
    } = {};
    if (input.role === "USER" || input.role === "ADMIN") {
      data.role = input.role;
      if (input.role === "ADMIN" && input.unlimitedGenerations === undefined) {
        data.unlimitedGenerations = true;
      }
    }
    if (typeof input.unlimitedGenerations === "boolean") {
      data.unlimitedGenerations = input.unlimitedGenerations;
    }
    if (typeof input.banned === "boolean") {
      data.bannedAt = input.banned ? new Date() : null;
    }
    if (Object.keys(data).length === 0) {
      return { success: false, error: messages.errors.generic };
    }

    await prisma.user.update({
      where: { id: input.userId },
      data,
    });
    return { success: true };
  } catch (err) {
    console.error("updateUserFlags error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
  role?: "USER" | "ADMIN";
  /** When true, mark email as verified so the user can sign in immediately. */
  verifyEmail?: boolean;
}): Promise<ActionResult<{ user: AdminUserRow }>> {
  try {
    if (!(await requireAdminId())) {
      return { success: false, error: messages.errors.adminsOnly };
    }

    const email = normalizeEmail(input.email);
    if (!isValidEmail(email) || !input.password) {
      return { success: false, error: messages.errors.validEmailAndPassword };
    }
    if (!isPasswordLongEnough(input.password)) {
      return { success: false, error: messages.errors.passwordTooShort };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: messages.errors.accountExists };
    }

    const role = input.role === "ADMIN" ? "ADMIN" : "USER";
    const name = input.name?.trim() || null;
    const password = await bcrypt.hash(input.password, 10);
    const verifyEmail = input.verifyEmail !== false;

    const row = await prisma.user.create({
      data: {
        email,
        name,
        password,
        role,
        emailVerified: verifyEmail ? new Date() : null,
        unlimitedGenerations: role === "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        unlimitedGenerations: true,
        generationsUsedToday: true,
        bannedAt: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        unlimitedGenerations: row.unlimitedGenerations,
        generationsUsedToday: row.generationsUsedToday,
        banned: row.bannedAt != null,
        createdAt: row.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("createUser error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function deleteUser(
  userId: string,
): Promise<ActionResult<object>> {
  try {
    const adminId = await requireAdminId();
    if (!adminId) return { success: false, error: messages.errors.adminsOnly };
    if (!userId.trim()) {
      return { success: false, error: messages.errors.generic };
    }
    if (userId === adminId) {
      return { success: false, error: "You can’t delete your own account here" };
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) {
      return { success: false, error: messages.errors.accountNotFound };
    }

    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  } catch (err) {
    console.error("deleteUser error:", err);
    return { success: false, error: messages.errors.generic };
  }
}
