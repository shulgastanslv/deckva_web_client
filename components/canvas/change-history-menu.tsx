"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowCounterClockwise as Restore,
  ClockCounterClockwise as History,
  Trash as Trash2,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

import {
  deleteProjectRevision,
  listProjectRevisions,
  restoreProjectRevision,
  type ProjectRevisionListItem,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { menuIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import { useSlidesController } from "@/context/canvas-manager";
import { useCanvasStore } from "@/store/useCanvasStore";
import { cn } from "@/lib/utils";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ChangeHistoryMenu() {
  const t = useTranslations("editor.history");
  const projectId = useCanvasStore((s) => s.currentProjectId);
  const slidesController = useSlidesController();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<ProjectRevisionListItem[]>([]);

  const refresh = useCallback(async () => {
    if (!projectId) {
      setRevisions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await listProjectRevisions(projectId);
      if (res.success) setRevisions(res.revisions);
      else setRevisions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open) return;
    void refresh();
  }, [open, refresh]);

  const onRestore = async (id: string) => {
    if (!projectId || busyId) return;
    setBusyId(id);
    try {
      const res = await restoreProjectRevision(projectId, id);
      if (!res.success) return;
      useCanvasStore.getState().loadProjectState(res.project);
      await slidesController?.loadCurrent();
      useCanvasStore.getState().markSaved();
      setOpen(false);
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!projectId || busyId) return;
    setBusyId(id);
    try {
      const res = await deleteProjectRevision(projectId, id);
      if (res.success) {
        setRevisions((list) => list.filter((item) => item.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={t("title")}
          aria-label={t("title")}
          disabled={!projectId}
          className={cn(
            "size-9 shrink-0 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/40 hover:text-foreground",
            "data-[state=open]:bg-muted/40 data-[state=open]:text-foreground",
            !projectId && "opacity-40",
          )}
        >
          <History className={menuIconClass} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-80 rounded-2xl p-1.5">
        <DropdownMenuLabel className="px-2.5 py-2 text-[13px] font-normal text-foreground">
          {t("title")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />

        <div className="max-h-72 overflow-y-auto py-1">
          {loading ? (
            <p className="px-2.5 py-3 text-[13px] text-muted-foreground">{t("restoring")}</p>
          ) : revisions.length === 0 ? (
            <p className="px-2.5 py-3 text-[13px] text-muted-foreground">{t("empty")}</p>
          ) : (
            revisions.map((item) => {
              const busy = busyId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50"
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted/50">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-normal text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {t("savedAt", { time: formatWhen(item.createdAt) })}
                      {" · "}
                      {item.slideCount}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={t("restore")}
                      aria-label={t("restore")}
                      disabled={busy}
                      onClick={() => void onRestore(item.id)}
                      className="size-8 rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    >
                      <Restore className="size-4 stroke-[1.5]" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={t("delete")}
                      aria-label={t("delete")}
                      disabled={busy}
                      onClick={() => void onDelete(item.id)}
                      className="size-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4 stroke-[1.5]" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
