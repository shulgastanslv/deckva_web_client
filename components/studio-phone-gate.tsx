"use client";

import { useEffect, useState, type ReactNode } from "react";

import { NotAvailablePhone } from "@/components/not-available-phone";

export function StudioPhoneGate({ children }: { children: ReactNode }) {
  const [isPhone, setIsPhone] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (isPhone === null) return <div className="h-dvh bg-background" />;
  if (isPhone) return <NotAvailablePhone />;
  return children;
}
