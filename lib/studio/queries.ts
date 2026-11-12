"use client";

import {
  QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { listMyNotifications, type NotificationItem } from "@/actions/admin";
import { getUserFolders } from "@/actions/folders";
import { getActiveOrganization, getUserOrganizations } from "@/actions/organizations";
import { getUserProjects } from "@/actions/projects";
import { getProfile } from "@/actions/user";
import { messages } from "@/lib/messages";

/** Shared TanStack Query keys for studio reads. */
export const studioKeys = {
  activeOrganization: ["studio", "active-organization"] as const,
  organizations: ["studio", "organizations"] as const,
  folders: ["studio", "folders"] as const,
  projectsRoot: ["studio", "projects"] as const,
  projects: (folderId = "", trashed = false) =>
    ["studio", "projects", folderId, trashed ? "trash" : "active"] as const,
  notifications: ["studio", "notifications"] as const,
  profile: ["studio", "profile"] as const,
};

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

export function useActiveOrganization(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.activeOrganization,
    queryFn: () => readStudioResult(() => getActiveOrganization()),
    staleTime: studioStaleTime.stable,
    enabled,
  });
}

export function useUserOrganizations(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.organizations,
    queryFn: () => readStudioResult(() => getUserOrganizations()),
    staleTime: studioStaleTime.stable,
    enabled,
  });
}

export function useUserFolders(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.folders,
    queryFn: () => readStudioResult(() => getUserFolders()),
    staleTime: studioStaleTime.stable,
    enabled,
  });
}

export function useUserProjects(
  folderId: string,
  enabled: boolean,
  options?: { trashed?: boolean },
) {
  const trashed = options?.trashed === true;
  return useQuery({
    queryKey: studioKeys.projects(folderId, trashed),
    queryFn: () =>
      readStudioResult(() =>
        getUserProjects(
          trashed
            ? { trashed: true }
            : folderId
              ? { folderId }
              : undefined,
        ),
      ),
    staleTime: studioStaleTime.projects,
    enabled,
  });
}

export function useMyNotifications(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.notifications,
    queryFn: () => readStudioResult(() => listMyNotifications()),
    staleTime: studioStaleTime.notifications,
    refetchInterval: enabled ? 12_000 : false,
    refetchOnWindowFocus: true,
    enabled,
    refetchOnReconnect: true,
  });
}

export function useMyProfile(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.profile,
    queryFn: () => readStudioResult(() => getProfile()),
    staleTime: studioStaleTime.stable,
    enabled,
  });
}

export function fetchActiveOrganization(client: QueryClient) {
  return client.fetchQuery({
    queryKey: studioKeys.activeOrganization,
    queryFn: () => readStudioResult(() => getActiveOrganization()),
    staleTime: studioStaleTime.stable,
  });
}

export function fetchUserProjects(
  client: QueryClient,
  folderId = "",
  options?: { trashed?: boolean },
) {
  const trashed = options?.trashed === true;
  return client.fetchQuery({
    queryKey: studioKeys.projects(folderId, trashed),
    queryFn: () =>
      readStudioResult(() =>
        getUserProjects(
          trashed
            ? { trashed: true }
            : folderId
              ? { folderId }
              : undefined,
        ),
      ),
    staleTime: studioStaleTime.projects,
  });
}

export function fetchMyNotifications(client: QueryClient) {
  return client.fetchQuery({
    queryKey: studioKeys.notifications,
    queryFn: () => readStudioResult(() => listMyNotifications()),
    staleTime: studioStaleTime.notifications,
  });
}

export function invalidateStudioProjects(client: QueryClient) {
  return client.invalidateQueries({ queryKey: studioKeys.projectsRoot });
}

export function invalidateStudioOrganizations(client: QueryClient) {
  return Promise.all([
    client.invalidateQueries({ queryKey: studioKeys.organizations }),
    client.invalidateQueries({ queryKey: studioKeys.activeOrganization }),
  ]);
}

export function invalidateStudioFolders(client: QueryClient) {
  return client.invalidateQueries({ queryKey: studioKeys.folders });
}

export function invalidateStudioOrgScope(client: QueryClient) {
  return Promise.all([
    invalidateStudioOrganizations(client),
    invalidateStudioFolders(client),
    invalidateStudioProjects(client),
  ]);
}

export function invalidateStudioProfile(client: QueryClient) {
  return client.invalidateQueries({ queryKey: studioKeys.profile });
}

export function invalidateStudioNotifications(client: QueryClient) {
  return client.invalidateQueries({ queryKey: studioKeys.notifications });
}

export function useInvalidateStudioProjects() {
  const client = useQueryClient();
  return () => invalidateStudioProjects(client);
}

type NotificationCache = {
  success: true;
  items: NotificationItem[];
  unread: number;
};

/** Keep the open panel marked read, and force the next list read to hit the server. */
export function markNotificationCacheRead(client: QueryClient) {
  client.setQueryData<NotificationCache>(studioKeys.notifications, (current) => {
    if (!current) return current;
    return {
      ...current,
      unread: 0,
      items: current.items.map((item) => ({ ...item, read: true })),
    };
  });
  void client.invalidateQueries({
    queryKey: studioKeys.notifications,
    refetchType: "none",
  });
}
