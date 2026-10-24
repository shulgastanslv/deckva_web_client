"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Folder,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";

import {
  createFolder,
  deleteFolder,
  getUserFolders,
  renameFolder,
  type FolderListItem,
} from "@/actions/folders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StudioFoldersSection() {
  const { status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");

  const [folders, setFolders] = useState<FolderListItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);

  const signedIn = status === "authenticated";

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setFolders([]);
      return;
    }
    const res = await getUserFolders();
    if (res.success) setFolders(res.folders);
  }, [signedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => {
      void refresh();
    };
    window.addEventListener("studio:folders-changed", onChanged);
    window.addEventListener("studio:org-changed", onChanged);
    return () => {
      window.removeEventListener("studio:folders-changed", onChanged);
      window.removeEventListener("studio:org-changed", onChanged);
    };
  }, [refresh]);

  const notifyChanged = () => {
    window.dispatchEvent(new CustomEvent("studio:folders-changed"));
  };

  const startCreate = () => {
    if (!signedIn || busy) return;
    setCreating(true);
    setDraftName("");
  };

  const submitCreate = async () => {
    if (busy) return;
    const name = draftName.trim();
    setBusy(true);
    try {
      const res = await createFolder(name || "Untitled folder");
      if (res.success) {
        setCreating(false);
        setDraftName("");
        await refresh();
        notifyChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  const submitRename = async (id: string) => {
    if (busy) return;
    const name = renameValue.trim();
    if (!name) {
      setRenamingId(null);
      return;
    }
    setBusy(true);
    try {
      const res = await renameFolder(id, name);
      if (res.success) {
        setRenamingId(null);
        await refresh();
        notifyChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  const removeFolder = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await deleteFolder(id);
      if (res.success) {
        await refresh();
        notifyChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 px-2.5">
      <div className="mb-1.5 flex items-center justify-between px-1.5">
        <p className="text-[12px] font-semibold text-neutral-500">Folders</p>
        <button
          type="button"
          aria-label="New folder"
          disabled={!signedIn || busy}
          onClick={startCreate}
          className="rounded-md p-0.5 text-neutral-400 transition-colors hover:bg-white/80 hover:text-neutral-700 disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {!signedIn ? (
        <p className="px-1.5 text-[12px] leading-relaxed text-neutral-400">
          Sign in to create folders.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {creating ? (
            <div className="px-1 py-1">
              <Input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Folder name"
                className="h-8 rounded-lg border-neutral-200 bg-white px-2 text-[12px] shadow-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitCreate();
                  }
                  if (e.key === "Escape") {
                    setCreating(false);
                    setDraftName("");
                  }
                }}
                onBlur={() => {
                  if (!draftName.trim()) {
                    setCreating(false);
                    return;
                  }
                  void submitCreate();
                }}
              />
            </div>
          ) : null}

          {folders.length === 0 && !creating ? (
            <p className="px-1.5 py-1 text-[12px] leading-relaxed text-neutral-400">
              Group carousels by client or campaign.
            </p>
          ) : null}

          {folders.map((folder) => {
            const active =
              pathname.startsWith("/studio/projects") &&
              activeFolderId === folder.id;

            if (renamingId === folder.id) {
              return (
                <div key={folder.id} className="px-1 py-1">
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="h-8 rounded-lg border-neutral-200 bg-white px-2 text-[12px] shadow-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void submitRename(folder.id);
                      }
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onBlur={() => void submitRename(folder.id)}
                  />
                </div>
              );
            }

            return (
              <div
                key={folder.id}
                className={cn(
                  "group flex h-9 items-center gap-1 rounded-xl pr-1 transition-colors",
                  active
                    ? "bg-white text-neutral-950 shadow-sm dark:bg-muted dark:text-foreground"
                    : "text-neutral-600 hover:bg-white/70 hover:text-neutral-950 dark:text-muted-foreground dark:hover:bg-muted/60",
                )}
              >
                <Link
                  href={`/studio/projects?folder=${folder.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 text-[13px] font-medium"
                >
                  <Folder className="size-4 shrink-0 stroke-[1.75]" />
                  <span className="truncate">{folder.name}</span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Folder actions"
                      className="rounded-md p-1 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-700 focus:opacity-100 dark:hover:bg-muted"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 text-[13px]"
                      onClick={() => {
                        setRenamingId(folder.id);
                        setRenameValue(folder.name);
                      }}
                    >
                      <Pencil className="size-3.5" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 text-[13px] text-destructive"
                      onClick={() => void removeFolder(folder.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
