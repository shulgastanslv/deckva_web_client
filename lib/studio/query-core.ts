import { QueryClient } from "@tanstack/react-query";

import { messages } from "@/lib/messages";

/** Shared TanStack Query keys for studio reads. */
export const studioKeys = {
  activeOrganization: ["studio", "active-organization"] as const,
  organizations: ["studio", "organizations"] as const,
  folders: ["studio", "folders"] as const,
  projectsRoot: ["studio", "projects"] as const,
  projects: (folderId = "") => ["studio", "projects", folderId] as const,
  artifactsRoot: ["studio", "artifacts"] as const,
  artifacts: (kind = "", folderId = "") =>
    ["studio", "artifacts", kind, folderId] as const,
  artifact: (id: string) => ["studio", "artifact", id] as const,
  projectAnnotations: (projectId: string) =>
    ["studio", "annotations", projectId] as const,
  notifications: ["studio", "notifications"] as const,
};

/** Same windows the previous in-memory cache used. */
export const studioStaleTime = {
  stable: 30_000,
  projects: 0,
  notifications: 5_000,
} as const;

export function createStudioQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}

type SuccessOf<T> = Extract<T, { success: true }>;

/**
 * Failed server results are thrown so TanStack Query does not keep them as fresh data.
 * The next read hits the server again. In-flight calls still share one request.
 */
export async function readStudioResult<T extends { success: boolean }>(
  load: () => Promise<T>,
): Promise<SuccessOf<T>> {
  const result = await load();
  if (!result.success) {
    const error =
      "error" in result &&
      typeof (result as { error?: unknown }).error === "string" &&
      (result as { error: string }).error
        ? (result as { error: string }).error
        : messages.errors.generic;
    throw new Error(error);
  }
  return result as SuccessOf<T>;
}
