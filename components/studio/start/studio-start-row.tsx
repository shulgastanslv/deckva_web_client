import type { ReactNode } from "react";

export function StudioStartRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
      {children}
    </div>
  );
}
