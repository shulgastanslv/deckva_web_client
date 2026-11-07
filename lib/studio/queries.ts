"use client";

import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { listMyNotifications, type NotificationItem } from "@/actions/admin";
import {
  getArtifactById,
  getUserArtifacts,
  listProjectAnnotations,
  type ArtifactKindValue,
} from "@/actions/artifacts";
import { getUserFolders } from "@/actions/folders";
import { getActiveOrganization, getUserOrganizations } from "@/actions/organizations";
import { getUserProjects } from "@/actions/projects";
import { getProfile } from "@/actions/user";
import { readStudioResult, studioKeys, studioStaleTime } from "@/lib/studio/query-core";

export { studioKeys, studioStaleTime } from "@/lib/studio/query-core";

const quiet = {
  retry: false as const,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
};

export function useActiveOrganization(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.activeOrganization,
    queryFn: () => readStudioResult(() => getActiveOrganization()),
    staleTime: studioStaleTime.stable,
    enabled,
    ...quiet,
  });
}

export function useUserOrganizations(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.organizations,
    queryFn: () => readStudioResult(() => getUserOrganizations()),
    staleTime: studioStaleTime.stable,
    enabled,
    ...quiet,
  });
}

export function useUserFolders(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.folders,
    queryFn: () => readStudioResult(() => getUserFolders()),
    staleTime: studioStaleTime.stable,
    enabled,
    ...quiet,
  });
}

export function useUserProjects(folderId: string, enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.projects(folderId),
    queryFn: () =>
      readStudioResult(() => getUserProjects(folderId ? { folderId } : undefined)),
    staleTime: studioStaleTime.projects,
    enabled,
    ...quiet,
  });
}

export function useUserArtifacts(
  kind: ArtifactKindValue | "",
  enabled: boolean,
  folderId = "",
) {
  return useQuery({
    queryKey: studioKeys.artifacts(kind, folderId),
    queryFn: () =>
      readStudioResult(() =>
        getUserArtifacts({
          ...(kind ? { kind } : {}),
          ...(folderId ? { folderId } : {}),
        }),
      ),
    staleTime: studioStaleTime.projects,
    enabled,
    ...quiet,
  });
}

export function useArtifact(artifactId: string, enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.artifact(artifactId),
    queryFn: () => readStudioResult(() => getArtifactById(artifactId)),
    staleTime: studioStaleTime.projects,
    enabled: enabled && Boolean(artifactId),
    ...quiet,
  });
}

export function useProjectAnnotations(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.projectAnnotations(projectId),
    queryFn: () => readStudioResult(() => listProjectAnnotations(projectId)),
    staleTime: studioStaleTime.projects,
    enabled: enabled && Boolean(projectId),
    ...quiet,
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
    retry: false,
    refetchOnReconnect: true,
  });
}

export function useMyProfile(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.profile,
    queryFn: () => readStudioResult(() => getProfile()),
    staleTime: studioStaleTime.stable,
    enabled,
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

export function invalidateStudioArtifacts(client: QueryClient) {
  return client.invalidateQueries({ queryKey: studioKeys.artifactsRoot });
}

export function useInvalidateStudioArtifacts() {
  const client = useQueryClient();
  return () => invalidateStudioArtifacts(client);
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
