import { messages } from "@/lib/messages";

/** Log the original error and show a catalog message in the toaster. */
export function reportError(
  error: unknown,
  message: string = messages.errors.generic,
) {
  console.error(error);
  if (typeof window === "undefined") return;
  void import("sonner").then(({ toast }) => {
    toast.error(message);
  });
}
