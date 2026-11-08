"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import {
  invalidateStudioFolders,
  invalidateStudioOrgScope,
  invalidateStudioProjects,
} from "@/lib/studio/queries";

/** Drop studio queries on sign-out and when studio events say the lists changed. */
export function StudioSessionCache() {
  const queryClient = useQueryClient();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") queryClient.clear();
  }, [status, queryClient]);

  useEffect(() => {
    const onOrg = () => {
      void invalidateStudioOrgScope(queryClient);
    };
    const onFolders = () => {
      void invalidateStudioFolders(queryClient);
    };
    const onProjects = () => {
      void invalidateStudioProjects(queryClient);
    };

    window.addEventListener("studio:org-changed", onOrg, true);
    window.addEventListener("studio:folders-changed", onFolders, true);
    window.addEventListener("core:projects-changed", onProjects, true);
    return () => {
      window.removeEventListener("studio:org-changed", onOrg, true);
      window.removeEventListener("studio:folders-changed", onFolders, true);
      window.removeEventListener("core:projects-changed", onProjects, true);
    };
  }, [queryClient]);

  return null;
}
