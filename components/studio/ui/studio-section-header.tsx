import type { ReactNode } from "react";

export function StudioSectionHeader({
  title,
  action,
  trailing,
}: {
  title: string;
  action?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {action}
      </div>
      {trailing}
    </div>
  );
}
