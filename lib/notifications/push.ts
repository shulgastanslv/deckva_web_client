import { getMessages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import {
  renderNotification,
  type NotifyTemplateId,
  type NotifyVars,
} from "@/lib/notifications/templates";

/** Low-level insert — use for invites / admin broadcasts with free-form copy. */
export async function createUserNotification(input: {
  userId: string;
  title: string;
  body: string;
  href?: string | null;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title.trim(),
      body: input.body.trim(),
      href: input.href?.trim() || null,
    },
  });
}

/**
 * Template inbox writer.
 *
 * @example
 * await StudioNotify.push(userId, "generationDone", {
 *   projectId,
 *   title: result.title,
 *   slidesCount: result.slides.length,
 * });
 */
export class StudioNotify {
  static async push(
    userId: string,
    template: NotifyTemplateId,
    vars: NotifyVars = {},
  ): Promise<void> {
    if (!userId.trim()) return;
    const catalog = await getMessages();
    const rendered = renderNotification(catalog, template, vars);
    await createUserNotification({
      userId,
      title: rendered.title,
      body: rendered.body,
      href: rendered.href,
    });
  }

  /** Fire-and-forget — never throws into the caller. */
  static voidPush(
    userId: string,
    template: NotifyTemplateId,
    vars: NotifyVars = {},
  ): void {
    void StudioNotify.push(userId, template, vars).catch((err) => {
      console.error("StudioNotify.push failed:", err);
    });
  }
}
