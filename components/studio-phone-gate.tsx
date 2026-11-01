"use client";

import type { ReactNode } from "react";

import { NotAvailablePhone } from "@/components/not-available-phone";
import { useMediaQuery } from "@/hooks/use-media-query";

const PHONE_QUERY = "(max-width: 767px)";

export function StudioPhoneGate({ children }: { children: ReactNode }) {
  const isPhone = useMediaQuery(PHONE_QUERY);

  if (isPhone === null) return <div className="h-dvh bg-background" />;
  if (isPhone) return <NotAvailablePhone />;
  return children;
}
