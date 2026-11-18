"use client";

import { notifyMe } from "@/actions/notifications";
import type {
  NotifyTemplateId,
  NotifyVars,
} from "@/lib/notifications/templates";

export const NOTIFICATIONS_CHANGED = "studio:notifications-changed";

export function signalNotificationsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED));
}

/** Push a template row for the signed-in user and refresh the inbox badge. */
export async function pushMyNotification(
  template: NotifyTemplateId,
  vars: NotifyVars = {},
): Promise<void> {
  const res = await notifyMe(template, vars);
  if (res.success) signalNotificationsChanged();
}
