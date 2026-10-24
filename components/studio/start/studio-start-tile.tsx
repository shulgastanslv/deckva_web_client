import type { ReactNode } from "react";
import { Plus } from "lucide-react";

export function StudioStartTile({
  title,
  onClick,
  icon,
  previewUrl,
}: {
  title: string;
  onClick: () => void;
  icon?: ReactNode;
  previewUrl?: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-[140px] shrink-0 flex-col gap-2.5 text-left sm:w-[152px]"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-shadow group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:bg-card dark:ring-white/10">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-muted-foreground">
            {icon ?? <Plus className="size-8 stroke-[1.25]" />}
          </span>
        )}
      </div>
      <p className="truncate px-0.5 text-[13px] font-medium text-neutral-900 dark:text-foreground">
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
      icon={<Plus className="size-8 stroke-[1.25]" />}
    />
  );
}
