import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StudioViewToggle({
  view,
  onChange,
}: {
  view: "list" | "grid";
  onChange: (view: "list" | "grid") => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-muted p-0.5">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Grid view"
        onClick={() => onChange("grid")}
        className={cn(
          "size-7 rounded-full",
          view === "grid"
            ? "bg-background text-foreground dark:bg-background/80"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="List view"
        onClick={() => onChange("list")}
        className={cn(
          "size-7 rounded-full",
          view === "list"
            ? "bg-background text-foreground dark:bg-background/80"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="size-3.5" />
      </Button>
    </div>
  );
}
