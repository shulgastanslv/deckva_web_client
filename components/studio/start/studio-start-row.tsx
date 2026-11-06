"use client";

import type { ReactNode } from "react";
import ScrollContainer from "react-indiana-drag-scroll";

export function StudioStartRow({ children }: { children: ReactNode }) {
  return (
    <ScrollContainer
      className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 select-none [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
    >
      {children}
    </ScrollContainer>
  );
}