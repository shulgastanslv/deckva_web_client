"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import { moveProjectToFolder } from "@/actions/folders";
import { useUserFolders } from "@/lib/studio/queries";
import {
  deleteProject,
  duplicateProject,
  toggleSaveProject,
  updateProjectTitle,
  type ProjectListItem,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const itemClass =
  "cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-[13px] focus:bg-muted/50";

export function StudioProjectMenu({
  project,
  onChanged,
}: {
  project: ProjectListItem;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(project.title);
  const folders = useUserFolders(open).data?.folders ?? [];

  const commitRename = async () => {
    const next = draft.trim();
    setRenaming(false);
    if (!next || next === project.title) return;
    await updateProjectTitle(project.id, next);
    onChanged();
  };

  const moveTo = async (folderId: string | null) => {
    await moveProjectToFolder(project.id, folderId);
    onChanged();
    window.dispatchEvent(new CustomEvent("studio:folders-changed"));
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setRenaming(false);
        if (next) setDraft(project.title);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full border-none bg-muted/40 text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground data-[state=open]:bg-muted/60 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-2xl p-1.5"
        onClick={(event) => event.stopPropagation()}
      >
        {renaming ? (
          <div className="px-1 py-1">
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  void commitRename();
                }
                if (e.key === "Escape") setRenaming(false);
              }}
              className="h-9 rounded-full border-none bg-muted/40 px-3 text-[13px] shadow-none focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
        ) : (
          <DropdownMenuItem
            className={itemClass}
            onSelect={(e) => {
              e.preventDefault();
              setRenaming(true);
            }}
          >
            <Pencil className="size-4 text-muted-foreground" />
            Rename
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className={itemClass}
          onClick={async () => {
            await duplicateProject(project.id);
            onChanged();
          }}
        >
          <Copy className="size-4 text-muted-foreground" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem
          className={itemClass}
          onClick={async () => {
            await toggleSaveProject(project.id);
            onChanged();
          }}
        >
          <Star className="size-4 text-muted-foreground" />
          {project.isSaved ? "Unstar" : "Star"}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={itemClass}>
            <FolderInput className="size-4 text-muted-foreground" />
            Move to folder
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-[180px] rounded-2xl p-1.5">
            <DropdownMenuItem
              className={itemClass}
              onClick={() => void moveTo(null)}
            >
              {!project.folderId ? (
                <Check className="size-3.5" />
              ) : (
                <span className="size-3.5" />
              )}
              No folder
            </DropdownMenuItem>
            {folders.map((folder) => (
              <DropdownMenuItem
                key={folder.id}
                className={itemClass}
                onClick={() => void moveTo(folder.id)}
              >
                {project.folderId === folder.id ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="size-3.5" />
                )}
                <span className="truncate">{folder.name}</span>
              </DropdownMenuItem>
            ))}
            {folders.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-muted-foreground">
                Create a folder in the sidebar first.
              </p>
            ) : null}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-1.5 bg-border/50" />

        <DropdownMenuItem
          variant="destructive"
          className={itemClass}
          onClick={async () => {
            await deleteProject(project.id);
            onChanged();
            window.dispatchEvent(new CustomEvent("studio:folders-changed"));
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
