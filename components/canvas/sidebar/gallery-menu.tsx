"use client";

import { useState } from "react";
import { Copy, MoreHorizontal, Pencil, Settings2, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const VISIBLE_KEYWORDS = 5;

export function GalleryMenu({
  title,
  createdAt,
  createdBy,
  category,
  ratio,
  canRename = true,
  starred = false,
  onRename,
  onEdit,
  onDuplicate,
  onDelete,
  onStar,
}: {
  title: string;
  createdAt: string;
  createdBy?: string | null;
  category?: string | null;
  ratio: string;
  canRename?: boolean;
  starred?: boolean;
  onRename?: (title: string) => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onStar?: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(title);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const when = new Date(createdAt);
  const dateLabel = Number.isNaN(when.getTime())
    ? createdAt
    : when.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  const keywords = [category, ratio, dateLabel].flatMap((value) => {
    if (!value) return [];
    return value
      .split(/[,/|]/)
      .map((part) => part.trim())
      .filter(Boolean);
  });
  const visible = showAllKeywords ? keywords : keywords.slice(0, VISIBLE_KEYWORDS);
  const hidden = keywords.length - visible.length;

  const commitRename = () => {
    const next = draft.trim();
    setRenaming(false);
    if (!next || next === title) return;
    onRename?.(next);
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) {
          setRenaming(false);
          setShowAllKeywords(false);
        }
        if (open) setDraft(title);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 rounded-full bg-background backdrop-blur-sm text-muted-foreground opacity-0 ring-1 ring-border/60 transition-opacity group-hover:opacity-100 hover:text-foreground"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        className="w-64 rounded-2xl bg-background backdrop-blur-sm p-0 text-popover-foreground shadow-xl ring-1 ring-foreground/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-4 pt-3.5 pb-2">
          {renaming ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                commitRename();
              }}
            >
              <Input
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                className="h-8 text-[13px] font-semibold"
                aria-label="Name"
              />
            </form>
          ) : (
            <p className="text-[13px] leading-snug font-semibold tracking-tight text-foreground">{title}</p>
          )}
          <p className="mt-1 text-[13px] text-muted-foreground">
            {createdBy ? `View more by ${createdBy}` : "View more by Swibp"}
          </p>
          {visible.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {visible.map((keyword, index) => (
                <span
                  key={`${keyword}-${index}`}
                  className="rounded-full border border-border/80 px-2 py-1 text-[13px] text-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
          {hidden > 0 ? (
            <button
              type="button"
              className="mt-2 text-[13px] text-violet-600 hover:underline dark:text-violet-300"
              onClick={() => setShowAllKeywords(true)}
            >
              Show all keywords
            </button>
          ) : null}
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />
       
        {canRename && onRename ? (
          <DropdownMenuItem
            className="cursor-pointer gap-3 rounded-none px-4 py-2.5 text-[13px]"
            onSelect={(event) => {
              event.preventDefault();
              setDraft(title);
              setRenaming(true);
            }}
          >
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
        ) : null}
        {onEdit ? (
          <DropdownMenuItem
            className="cursor-pointer gap-3 rounded-none px-4 py-2.5 text-[13px]"
            onClick={onEdit}
          >
            <Settings2 className="size-4" />
            Edit
          </DropdownMenuItem>
        ) : null}
        {onDuplicate ? (
          <DropdownMenuItem className="cursor-pointer gap-3 rounded-none px-4 py-2.5 text-[13px]" onClick={onDuplicate}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
        ) : null}
        {onDelete ? (
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-3 rounded-none px-4 py-2.5 text-[13px]"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
