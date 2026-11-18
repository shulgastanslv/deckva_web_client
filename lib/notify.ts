"use client";

import { toast, type ExternalToast } from "sonner";

export type NotifyPayload = {
  /** Short headline shown in the toast. */
  title: string;
  /** Optional second line. */
  description?: string;
  duration?: number;
  id?: string | number;
};

type NotifyInput = string | NotifyPayload;

function unpack(input: NotifyInput): {
  message: string;
  options?: ExternalToast;
} {
  if (typeof input === "string") return { message: input };
  const { title, description, duration, id } = input;
  return {
    message: title,
    options: {
      ...(description ? { description } : {}),
      ...(duration != null ? { duration } : {}),
      ...(id != null ? { id } : {}),
    },
  };
}

/**
 * Ephemeral Sonner toasts (errors, loading, quick save feedback).
 * Inbox / DB rows live in `lib/notifications` (`StudioNotify` / `pushMyNotification`).
 *
 * @example
 * notify.loading(t("exporting"));
 * notify.fromError(err, messages.errors.generic);
 */
export class Notify {
  success(input: NotifyInput) {
    if (typeof window === "undefined") return;
    const { message, options } = unpack(input);
    toast.success(message, options);
  }

  error(input: NotifyInput) {
    if (typeof window === "undefined") return;
    const { message, options } = unpack(input);
    toast.error(message, options);
  }

  info(input: NotifyInput) {
    if (typeof window === "undefined") return;
    const { message, options } = unpack(input);
    toast.message(message, options);
  }

  /** Returns a toast id — call `notify.dismiss(id)` or `notify.success` with the same id. */
  loading(input: NotifyInput) {
    if (typeof window === "undefined") return undefined;
    const { message, options } = unpack(input);
    return toast.loading(message, options);
  }

  dismiss(id?: string | number) {
    if (typeof window === "undefined") return;
    toast.dismiss(id);
  }

  /** console.error + error toast. Drop-in for `reportError`. */
  fromError(error: unknown, input: NotifyInput) {
    console.error(error);
    this.error(input);
  }
}

/** Shared instance — import `{ notify }` anywhere on the client. */
export const notify = new Notify();
