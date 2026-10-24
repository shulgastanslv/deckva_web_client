import type { ReactNode } from "react";

export function StudioStartRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:gap-5">
      {children}
    </div>
  );
}
