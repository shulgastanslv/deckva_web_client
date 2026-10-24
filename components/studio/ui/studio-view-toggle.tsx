import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";

export function StudioViewToggle({
  view,
  onChange,
}: {
  view: "list" | "grid";
  onChange: (view: "list" | "grid") => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        aria-label="Grid view"
        onClick={() => onChange("grid")}
        className={cn(
          "rounded-md p-1.5 transition-colors",
          view === "grid"
            ? "text-neutral-950 dark:text-foreground"
            : "text-neutral-400 hover:text-neutral-700 dark:text-muted-foreground",
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        type="button"
        aria-label="List view"
        onClick={() => onChange("list")}
        className={cn(
          "rounded-md p-1.5 transition-colors",
          view === "list"
            ? "text-neutral-950 dark:text-foreground"
            : "text-neutral-400 hover:text-neutral-700 dark:text-muted-foreground",
        )}
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
