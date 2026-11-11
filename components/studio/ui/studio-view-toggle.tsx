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
    <div className="flex h-9 items-center gap-0.5 rounded-md bg-muted/40 p-0.5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Grid view"
        onClick={() => onChange("grid")}
        className={cn(
          "size-8 rounded-md border-none shadow-none",
          view === "grid"
            ? "bg-background text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="List view"
        onClick={() => onChange("list")}
        className={cn(
          "size-8 rounded-md border-none shadow-none",
          view === "list"
            ? "bg-background text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <List className="size-4" />
      </Button>
    </div>
  );
}
