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
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h2 className="text-[16px] font-semibold tracking-tight text-neutral-950 dark:text-foreground">
          {title}
        </h2>
        {action}
      </div>
      {trailing}
    </div>
  );
}
