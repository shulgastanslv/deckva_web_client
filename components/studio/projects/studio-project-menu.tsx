"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import {
  getUserFolders,
  moveProjectToFolder,
  type FolderListItem,
} from "@/actions/folders";
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

export function StudioProjectMenu({
  project,
  onChanged,
}: {
  project: ProjectListItem;
  onChanged: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(project.title);
  const [folders, setFolders] = useState<FolderListItem[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await getUserFolders();
      if (res.success) setFolders(res.folders);
    })();
  }, []);

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
      onOpenChange={(open) => {
        if (!open) setRenaming(false);
        if (open) {
          setDraft(project.title);
          void (async () => {
            const res = await getUserFolders();
            if (res.success) setFolders(res.folders);
          })();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-full bg-background text-muted-foreground opacity-0 ring-1 ring-border/60 transition-opacity group-hover:opacity-100 hover:text-foreground"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-56 rounded-2xl p-1.5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {renaming ? (
          <div className="px-1.5 py-1.5">
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
              className="h-8 text-[13px]"
            />
          </div>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
            onSelect={(e) => {
              e.preventDefault();
              setRenaming(true);
            }}
          >
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
          onClick={async () => {
            await duplicateProject(project.id);
            onChanged();
          }}
        >
          <Copy className="size-4" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
          onClick={async () => {
            await toggleSaveProject(project.id);
            onChanged();
          }}
        >
          <Star className="size-4" />
          {project.isSaved ? "Unstar" : "Star"}
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
            <FolderInput className="size-4" />
            Move to folder
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-[180px] rounded-xl p-1.5">
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-[13px]"
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
                className="cursor-pointer gap-2 rounded-lg text-[13px]"
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
              <p className="px-2.5 py-2 text-[12px] text-muted-foreground">
                Create a folder in the sidebar first.
              </p>
            ) : null}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-[13px]"
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
