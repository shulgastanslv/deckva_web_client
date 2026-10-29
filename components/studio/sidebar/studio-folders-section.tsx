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
import { getActiveOrganization } from "@/actions/organizations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { isUpgradeRequiredError } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

export function StudioFoldersSection() {
  const { status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");

  const [folders, setFolders] = useState<FolderListItem[]>([]);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);

  const signedIn = status === "authenticated";

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setFolders([]);
      setIsUpgrade(false);
      return;
    }
    const [foldersRes, orgRes] = await Promise.all([
      getUserFolders(),
      getActiveOrganization(),
    ]);
    if (foldersRes.success) setFolders(foldersRes.folders);
    if (orgRes.success) setIsUpgrade(Boolean(orgRes.organization?.isUpgrade));
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

  const openUpgrade = () => {
    window.dispatchEvent(new CustomEvent("studio:open-upgrade"));
  };

  const startCreate = () => {
    if (!signedIn || busy) return;
    if (!isUpgrade) {
      openUpgrade();
      return;
    }
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
      } else if ("error" in res && isUpgradeRequiredError(res.error)) {
        setCreating(false);
        openUpgrade();
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
        <p className="text-[12px] font-medium text-muted-foreground">Folders</p>
        <button
          type="button"
          aria-label="New folder"
          disabled={!signedIn || busy}
          onClick={startCreate}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {!signedIn ? (
        <p className="px-1.5 text-[12px] leading-relaxed text-muted-foreground">
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
                className="h-8 rounded-full border-0 bg-background px-3 text-[12px] shadow-none dark:bg-muted/40"
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
            <p className="px-1.5 py-1 text-[12px] leading-relaxed text-muted-foreground">
              {isUpgrade
                ? "Group carousels by client or campaign."
                : "Folders are a Pro feature."}
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
                    className="h-8 rounded-full border-0 bg-background px-3 text-[12px] shadow-none dark:bg-muted/40"
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
                    ? "bg-background text-foreground dark:bg-muted"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:hover:bg-muted/50",
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
                      className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus:opacity-100"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[140px] rounded-2xl border-0 bg-muted p-1.5 shadow-none"
                  >
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-xl text-[13px]"
                      onClick={() => {
                        setRenamingId(folder.id);
                        setRenameValue(folder.name);
                      }}
                    >
                      <Pencil className="size-3.5" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-xl text-[13px] text-destructive"
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
