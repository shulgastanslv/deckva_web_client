"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { studioKeys } from "@/lib/studio/query-core";

/** Drop studio queries on sign-out and when studio events say the lists changed. */
export function StudioSessionCache() {
  const queryClient = useQueryClient();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") queryClient.clear();
  }, [status, queryClient]);

  useEffect(() => {
    const onOrg = () => {
      void queryClient.invalidateQueries({ queryKey: studioKeys.activeOrganization });
      void queryClient.invalidateQueries({ queryKey: studioKeys.organizations });
      void queryClient.invalidateQueries({ queryKey: studioKeys.folders });
      void queryClient.invalidateQueries({ queryKey: studioKeys.projectsRoot });
    };
    const onFolders = () => {
      void queryClient.invalidateQueries({ queryKey: studioKeys.folders });
    };
    const onProjects = () => {
      void queryClient.invalidateQueries({ queryKey: studioKeys.projectsRoot });
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
