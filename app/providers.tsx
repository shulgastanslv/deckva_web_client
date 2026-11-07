"use client";

import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";

import * as React from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { CanvasManagerProvider } from "@/context/canvas-manager";
import { createStudioQueryClient } from "@/lib/studio/query-core";

export interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = React.useState(createStudioQueryClient);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CanvasManagerProvider>
            {children}
            <Toaster />
          </CanvasManagerProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
