"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { forgetCachedRead } from "@/lib/studio/read-cache";

/** A signed-out session must not reuse the previous account's list cache. */
export function StudioSessionCache() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") forgetCachedRead();
  }, [status]);

  return null;
}
