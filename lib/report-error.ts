import { messages } from "@/lib/messages";
import { notify } from "@/lib/notify";

/** Log the original error and show a catalog message in the toaster. */
export function reportError(
  error: unknown,
  message: string = messages.errors.generic,
) {
  notify.fromError(error, message);
}
