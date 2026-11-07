"use server";

import { messages } from "@/lib/messages";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { emailIsAdmin } from "@/lib/auth-role";
import { prisma } from "@/lib/prisma";

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
  createdAt: string;
  read: boolean;
}

async function requireAdminId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });
  if (!user) return null;
  if (user.role === "ADMIN" || emailIsAdmin(user.email)) {
    if (user.role !== "ADMIN") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    }
    return user.id;
  }
  return null;
}

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
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

export async function listMyNotifications(): Promise<
  ActionResult<{ items: NotificationItem[]; unread: number }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const items = rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
      read: row.readAt != null,
    }));
    return { success: true, items, unread: items.filter((item) => !item.read).length };
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
