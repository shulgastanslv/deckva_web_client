"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border-0 bg-foreground text-background shadow-none",
          title: "text-background",
          description: "text-background/80",
        },
        style: {
          boxShadow: "none",
          borderRadius: "1rem",
          background: "var(--foreground)",
          color: "var(--background)",
          border: "none",
        },
      }}
    />
  );
}
