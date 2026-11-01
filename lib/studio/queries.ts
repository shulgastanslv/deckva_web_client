"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { listMyNotifications, type NotificationItem } from "@/actions/admin";
import { getUserFolders } from "@/actions/folders";
import { getActiveOrganization, getUserOrganizations } from "@/actions/organizations";
import { getUserProjects } from "@/actions/projects";
import { readStudioResult, studioKeys, studioStaleTime } from "@/lib/studio/query-core";

export { studioKeys, studioStaleTime } from "@/lib/studio/query-core";

const quiet = {
  retry: false as const,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
};

/** Server render and the first client render stay empty so the markup matches. */
function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function useActiveOrganization(enabled: boolean) {
  const ready = useClientReady();
  return useQuery({
    queryKey: studioKeys.activeOrganization,
    queryFn: () => readStudioResult(() => getActiveOrganization()),
    staleTime: studioStaleTime.stable,
    enabled: enabled && ready,
    ...quiet,
  });
}

export function useUserOrganizations(enabled: boolean) {
  const ready = useClientReady();
  return useQuery({
    queryKey: studioKeys.organizations,
    queryFn: () => readStudioResult(() => getUserOrganizations()),
    staleTime: studioStaleTime.stable,
    enabled: enabled && ready,
    ...quiet,
  });
}

export function useUserFolders(enabled: boolean) {
  const ready = useClientReady();
  return useQuery({
    queryKey: studioKeys.folders,
    queryFn: () => readStudioResult(() => getUserFolders()),
    staleTime: studioStaleTime.stable,
    enabled: enabled && ready,
    ...quiet,
  });
}

export function useUserProjects(folderId: string, enabled: boolean) {
  const ready = useClientReady();
  return useQuery({
    queryKey: studioKeys.projects(folderId),
    queryFn: () =>
      readStudioResult(() => getUserProjects(folderId ? { folderId } : undefined)),
    staleTime: studioStaleTime.projects,
    enabled: enabled && ready,
    ...quiet,
  });
}

export function useMyNotifications(enabled: boolean) {
  const ready = useClientReady();
  return useQuery({
    queryKey: studioKeys.notifications,
    queryFn: () => readStudioResult(() => listMyNotifications()),
    staleTime: studioStaleTime.notifications,
    enabled: enabled && ready,
    ...quiet,
  });
}

export function fetchActiveOrganization(client: QueryClient) {
  return client.fetchQuery({
    queryKey: studioKeys.activeOrganization,
    queryFn: () => readStudioResult(() => getActiveOrganization()),
    staleTime: studioStaleTime.stable,
  });
}

export function fetchUserProjects(client: QueryClient, folderId = "") {
  return client.fetchQuery({
    queryKey: studioKeys.projects(folderId),
    queryFn: () =>
      readStudioResult(() => getUserProjects(folderId ? { folderId } : undefined)),
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

export function useInvalidateStudioProjects() {
  const client = useQueryClient();
  return () => invalidateStudioProjects(client);
}
