"use client";

import { listMyNotifications } from "@/actions/admin";
import { getUserFolders } from "@/actions/folders";
import { getActiveOrganization, getUserOrganizations } from "@/actions/organizations";
import { getUserProjects } from "@/actions/projects";
import { cachedRead } from "@/lib/studio/read-cache";

/** Lists that change only when a studio event fires. The event drops the cache first. */
const STABLE_MS = 30_000;
/** Project lists are refreshed by direct callbacks that do not always emit an event. */
const PROJECTS_MS = 0;
const NOTIFICATIONS_MS = 5000;

export function readActiveOrganization() {
  return cachedRead("active-org", STABLE_MS, () => getActiveOrganization());
}

export function readUserOrganizations() {
  return cachedRead("orgs", STABLE_MS, () => getUserOrganizations());
}

export function readUserFolders() {
  return cachedRead("folders", STABLE_MS, () => getUserFolders());
}

export function readUserProjects(options?: { folderId?: string | null }) {
  const folderId = options?.folderId || "";
  return cachedRead(`projects:${folderId}`, PROJECTS_MS, () =>
    getUserProjects(folderId ? { folderId } : undefined),
  );
}

export function readMyNotifications() {
  return cachedRead("notifications", NOTIFICATIONS_MS, () => listMyNotifications());
}
