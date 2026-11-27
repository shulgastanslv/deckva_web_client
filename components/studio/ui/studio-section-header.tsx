import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StudioSectionHeader({
  title,
  hint,
  action,
  trailing,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  trailing?: ReactNode;
}) {
  const heading = (
    <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
      {title}
    </h2>
  );

  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="cursor-default text-[18px] font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6} className="max-w-64">
              {hint}
            </TooltipContent>
          </Tooltip>
        ) : (
          heading
        )}
        {action}
      </div>
      {trailing}
    </div>
  );
}
