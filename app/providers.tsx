"use client";

import { ThemeProvider } from "next-themes";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { CanvasManagerProvider } from "@/context/canvas-manager";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <CanvasManagerProvider>{children}</CanvasManagerProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
