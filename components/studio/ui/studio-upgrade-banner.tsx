"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";

import { getActiveOrganization } from "@/actions/organizations";
import { getUserProjects } from "@/actions/projects";
import {
  FREE_CAROUSEL_LIMIT,
  freeCarouselLimitMessage,
} from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "studio:upgrade-banner-dismissed";

export function StudioUpgradeBanner({ className }: { className?: string }) {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [visible, setVisible] = useState(false);

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setVisible(false);
      return;
    }
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(DISMISS_KEY) === "1"
    ) {
      setVisible(false);
      return;
    }

    const [orgRes, projectsRes] = await Promise.all([
      getActiveOrganization(),
      getUserProjects(),
    ]);

    if (!orgRes.success || orgRes.organization.isUpgrade) {
      setVisible(false);
      return;
    }

    const count = projectsRes.success ? projectsRes.projects.length : 0;
    setVisible(count >= FREE_CAROUSEL_LIMIT);
  }, [signedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => void refresh();
    window.addEventListener("studio:org-changed", onChanged);
    window.addEventListener("core:projects-changed", onChanged);
    return () => {
      window.removeEventListener("studio:org-changed", onChanged);
      window.removeEventListener("core:projects-changed", onChanged);
    };
  }, [refresh]);

  if (!visible) return null;

  const openUpgrade = () => {
    window.dispatchEvent(new CustomEvent("studio:open-upgrade"));
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div className={cn("shrink-0 px-4 pt-2 sm:px-5", className)}>
      <div className="flex items-center gap-3 rounded-2xl bg-[#4262ff] px-4 py-2.5 text-white">
        <ArrowUpCircle
          className="size-5 shrink-0 stroke-[1.75] opacity-95"
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-[13px] leading-snug sm:text-[14px]">
          {freeCarouselLimitMessage()}{" "}
          <button
            type="button"
            onClick={openUpgrade}
            className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-90"
          >
            Upgrade
          </button>
        </p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="shrink-0 rounded-full p-1 opacity-80 transition-opacity hover:bg-white/15 hover:opacity-100"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
