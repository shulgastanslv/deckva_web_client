import type { ReactNode } from "react";

import {
  StudioIcon,
  type StudioIconName,
} from "@/components/studio/ui/studio-icons";
import { cn } from "@/lib/utils";

export function StudioStartTile({
  title,
  onClick,
  icon,
  iconName,
  previewUrl,
  blank,
}: {
  title: string;
  onClick: () => void;
  icon?: ReactNode;
  iconName?: StudioIconName;
  previewUrl?: string | null;
  blank?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-[200px] shrink-0 flex-col gap-2.5 text-left sm:w-[168px]"
    >
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-xl transition-colors",
          blank
            ? "bg-background ring-1 ring-border/70"
            : "bg-muted/50 group-hover:bg-muted/35",
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="size-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
            draggable={false}
          />
        ) : iconName ? (
          <StudioIcon
            name={iconName}
            className="absolute inset-0 size-full p-2 transition-transform duration-200 group-hover:scale-[1.02] sm:p-2.5"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            {icon ?? <StudioIcon name="plus" className="size-full p-2" />}
          </span>
        )}
      </div>
      <p className="truncate px-0.5 text-[13px] font-semibold text-foreground">
        {title}
      </p>
    </button>
  );
}

export function StudioCreateTile({ onClick }: { onClick: () => void }) {
  return (
    <StudioStartTile
      title="Blank carousel"
      onClick={onClick}
      blank
      iconName="plus"
    />
  );
}
