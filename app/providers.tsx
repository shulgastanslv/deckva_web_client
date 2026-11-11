"use client";

import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { IconContext } from "@phosphor-icons/react";

import * as React from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { CanvasManagerProvider } from "@/context/canvas-manager";
import { createStudioQueryClient } from "@/lib/studio/queries";

export interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

const phosphorIcons = { weight: "regular" as const };

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = React.useState(createStudioQueryClient);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <IconContext.Provider value={phosphorIcons}>
            <CanvasManagerProvider>
              {children}
              <Toaster />
            </CanvasManagerProvider>
          </IconContext.Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
