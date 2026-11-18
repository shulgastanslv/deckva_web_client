"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { StudioNotify } from "@/lib/notifications/push";
import type {
  NotifyTemplateId,
  NotifyVars,
} from "@/lib/notifications/templates";

type ActionResult = { success: true } | { success: false; error: string };

const ALLOWED: ReadonlySet<NotifyTemplateId> = new Set([
  "projectCreated",
  "generationDone",
  "published",
  "republished",
  "unpublished",
  "exported",
  "copied",
  "imported",
]);

/**
 * Client entry for template inbox rows (export, blank project, copy, …).
 * Prefer calling `StudioNotify` from other server actions when you already have userId.
 */
export async function notifyMe(
  template: NotifyTemplateId,
  vars: NotifyVars = {},
): Promise<ActionResult> {
  try {
    if (!ALLOWED.has(template)) {
      return { success: false, error: messages.errors.generic };
    }
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    await StudioNotify.push(userId, template, vars);
    return { success: true };
  } catch (err) {
    console.error("notifyMe error:", err);
    return { success: false, error: messages.errors.sendNotification };
  }
}
