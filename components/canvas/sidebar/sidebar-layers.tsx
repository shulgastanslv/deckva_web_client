"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CaretRight as ChevronRight,
  Copy,
  Eye,
  EyeSlash as EyeOff,
  Folder,
  Image as ImageIcon,
  Lock,
  DotsThree as MoreHorizontal,
  PencilSimple as Pencil,
  Square,
  Trash as Trash2,
  TextT as Type,
  LockOpen as Unlock,
  SelectionInverse as Ungroup,
} from "@phosphor-icons/react";
import { ActiveSelection, type FabricObject } from "fabric";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  BringForwardIcon,
  BringToFrontIcon,
  SendBackwardIcon,
  SendToBackIcon,
} from "@/components/canvas/layer-order-icons";
import { useCanvasManager } from "@/context/canvas-manager";
import { useCanvasObjects } from "@/hooks/use-canvas-objects";
import { ungroupSelection } from "@/lib/canvas/group";
import {
  dedupeLayerIds,
  ensureLayerId,
  isInside,
  isLayerGroup,
  isLayerLocked,
  isUserLayer,
  layerLabel,
  layerParent,
  moveLayerStep,
  placeLayer,
  prepareGroups,
  remintLayerTreeIds,
  removeLayer,
  setLayerLocked,
  setLayerName,
  setLayerVisible,
  type LayerObject,
} from "@/lib/canvas/layers";
import { sidebarPanel } from "@/components/canvas/sidebar/sidebar-ui";

type DropEdge = "before" | "after" | "inside";

type DropMark = {
  id: string;
  edge: DropEdge;
};

function layerGlyph(obj: FabricObject) {
  const type = obj.type;
  if (type === "group") return Folder;
  if (type === "image") return ImageIcon;
  if (type === "text" || type === "i-text" || type === "textbox") return Type;
  return Square;
}

function flatten(objects: FabricObject[], collapsed: Set<string>, depth = 0): { obj: FabricObject; depth: number }[] {
  const rows: { obj: FabricObject; depth: number }[] = [];
  for (const obj of objects.filter(isUserLayer).slice().reverse()) {
    rows.push({ obj, depth });
    const id = (obj as LayerObject).swibpId;
    if (isLayerGroup(obj) && obj.getObjects().some(isUserLayer) && !(id && collapsed.has(id))) {
      rows.push(...flatten(obj.getObjects(), collapsed, depth + 1));
    }
  }
  return rows;
}

function isRowSelected(active: FabricObject | null, obj: FabricObject) {
  if (!active) return false;
  if (active === obj) return true;
  if (active.type === "activeselection") return (active as ActiveSelection).getObjects().includes(obj);
  return false;
}

function selectionMembers(active: FabricObject | null): FabricObject[] {
  if (!active) return [];
  if (active.type === "activeselection") {
    return (active as ActiveSelection).getObjects();
  }
  return [active];
}

export function SidebarLayers() {
  const t = useTranslations("editor.layers");
  const manager = useCanvasManager();
  const objects = useCanvasObjects();
  const [selected, setSelected] = useState<FabricObject | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [drop, setDrop] = useState<DropMark | null>(null);
  const dragging = useRef<FabricObject | null>(null);
  const anchorRef = useRef<FabricObject | null>(null);

  useEffect(() => {
    if (!manager) return;
    setSelected(manager.getActiveObject());
    return manager.on("selection", (object) => setSelected(object));
  }, [manager]);

  useEffect(() => {
    prepareGroups(objects);
  }, [objects]);

  // Sync before paint — cloned/template objects often share swibpId.
  dedupeLayerIds(objects);
  const rows = flatten(objects, collapsed);

  const run = (work: () => boolean | void) => {
    manager?.transact(work);
  };

  const applySelection = (targets: FabricObject[]) => {
    if (!manager) return;
    const canvas = manager.canvas;
    const unique = Array.from(new Set(targets));
    if (unique.length === 0) {
      canvas.discardActiveObject();
    } else if (unique.length === 1) {
      canvas.setActiveObject(unique[0]!);
    } else {
      canvas.discardActiveObject();
      canvas.setActiveObject(new ActiveSelection(unique, { canvas }));
    }
    canvas.requestRenderAll();
  };

  /** Figma-like: click = one, ⌘/Ctrl = toggle, Shift = range (same parent). */
  const select = (obj: FabricObject, event: React.MouseEvent) => {
    if (!manager) return;
    const meta = event.metaKey || event.ctrlKey;
    const shift = event.shiftKey;
    const parent = layerParent(obj);
    const siblings = rows
      .map((row) => row.obj)
      .filter((item) => layerParent(item) === parent);
    const current = selectionMembers(selected).filter(
      (item) => layerParent(item) === parent,
    );

    if (shift && anchorRef.current && layerParent(anchorRef.current) === parent) {
      const a = siblings.indexOf(anchorRef.current);
      const b = siblings.indexOf(obj);
      if (a >= 0 && b >= 0) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        const range = siblings.slice(lo, hi + 1);
        applySelection(meta ? [...current, ...range] : range);
        return;
      }
    }

    if (meta) {
      if (current.includes(obj)) {
        applySelection(current.filter((item) => item !== obj));
      } else {
        applySelection([...current, obj]);
      }
      anchorRef.current = obj;
      return;
    }

    applySelection([obj]);
    anchorRef.current = obj;
  };

  const selectedSet = useMemo(() => new Set(selectionMembers(selected)), [selected]);

  const deleteTargets = (obj: FabricObject) => {
    if (!manager) return;
    const targets =
      selectedSet.has(obj) && selectedSet.size > 1
        ? Array.from(selectedSet)
        : [obj];
    run(() => {
      manager.canvas.discardActiveObject();
      for (const item of targets) removeLayer(manager.canvas, item);
    });
  };

  const setVisibleTargets = (obj: FabricObject, visible: boolean) => {
    const targets =
      selectedSet.has(obj) && selectedSet.size > 1
        ? Array.from(selectedSet)
        : [obj];
    run(() => {
      for (const item of targets) setLayerVisible(item, visible);
    });
  };

  const setLockedTargets = (obj: FabricObject, locked: boolean) => {
    const targets =
      selectedSet.has(obj) && selectedSet.size > 1
        ? Array.from(selectedSet)
        : [obj];
    run(() => {
      for (const item of targets) setLayerLocked(item, locked);
    });
  };

  const commitName = (obj: FabricObject) => {
    const id = (obj as LayerObject).swibpId;
    if (renamingId && id === renamingId) {
      const prev = ((obj as LayerObject).swibpName ?? "").trim();
      const next = draft.trim();
      if (next !== prev) run(() => setLayerName(obj, next));
    }
    setRenamingId(null);
  };

  const startRename = (obj: FabricObject) => {
    const id = ensureLayerId(obj);
    setDraft((obj as LayerObject).swibpName ?? "");
    setRenamingId(id);
    manager?.selectObject(obj);
  };

  const duplicate = (obj: FabricObject) => {
    if (!manager) return;
    void obj.clone().then((cloned: FabricObject) => {
      remintLayerTreeIds(cloned);
      run(() => {
        const parent = layerParent(obj);
        const list = parent ? parent.getObjects() : manager.canvas.getObjects();
        const index = list.indexOf(obj);
        cloned.set({
          left: (obj.left ?? 0) + 16,
          top: (obj.top ?? 0) + 16,
        });
        if (parent) parent.insertAt(Math.max(0, index) + 1, cloned);
        else manager.canvas.insertAt(Math.max(0, index) + 1, cloned);
        manager.canvas.setActiveObject(cloned);
      });
    });
  };

  const onDragStart = (event: React.DragEvent, obj: FabricObject) => {
    dragging.current = obj;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", ensureLayerId(obj));
  };

  const onDragOver = (event: React.DragEvent, obj: FabricObject) => {
    event.preventDefault();
    const source = dragging.current;
    if (!source || source === obj || isInside(source, obj)) {
      setDrop(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    const edge: DropEdge =
      isLayerGroup(obj) && ratio > 0.28 && ratio < 0.72 ? "inside" : ratio < 0.5 ? "before" : "after";
    setDrop({ id: ensureLayerId(obj), edge });
  };

  const onDrop = (event: React.DragEvent, obj: FabricObject) => {
    event.preventDefault();
    const source = dragging.current;
    const mark = drop;
    dragging.current = null;
    setDrop(null);
    if (!manager || !source || !mark || mark.id !== ensureLayerId(obj)) return;
    if (source === obj || isInside(source, obj)) return;

    if (mark.edge === "inside" && isLayerGroup(obj)) {
      run(() => placeLayer(manager.canvas, source, obj, obj.getObjects().length));
      setCollapsed((current) => {
        const next = new Set(current);
        next.delete(ensureLayerId(obj));
        return next;
      });
      return;
    }

    const parent = layerParent(obj);
    const list = parent ? parent.getObjects() : manager.canvas.getObjects();
    const index = list.indexOf(obj);
    if (index < 0) return;
    const destIndex = mark.edge === "before" ? index + 1 : index;
    run(() => placeLayer(manager.canvas, source, parent, destIndex));
  };

  const endDrag = () => {
    dragging.current = null;
    setDrop(null);
  };

  return (
    <div className={cn(sidebarPanel, "gap-0.5")}>
      {rows.length === 0 && (
        <p className="px-1 py-6 text-left text-[13px] text-muted-foreground">
          {t("empty")}
        </p>
      )}

      {rows.map(({ obj, depth }) => {
        const id = ensureLayerId(obj);
        const children = isLayerGroup(obj) ? obj.getObjects().some(isUserLayer) : false;
        const open = !collapsed.has(id);
        const hidden = obj.visible === false;
        const locked = isLayerLocked(obj);
        const active = selectedSet.has(obj) || isRowSelected(selected, obj);
        const renaming = renamingId === id;
        const Icon = layerGlyph(obj);
        const mark = drop?.id === id ? drop.edge : null;
        const multi = selectedSet.has(obj) && selectedSet.size > 1;
        const menuItem =
          "cursor-pointer gap-2 rounded-md px-2.5 py-2.5 text-[13px] font-normal text-foreground focus:bg-muted/50 focus:text-foreground";

        return (
          <div key={id} className="relative" style={{ paddingLeft: depth * 12 }}>
            {mark === "before" && <div className="absolute inset-x-1 top-0 z-10 h-0.5 rounded-md bg-foreground" />}
            {mark === "after" && <div className="absolute inset-x-1 bottom-0 z-10 h-0.5 rounded-md bg-foreground" />}
            <div
              onDragOver={(event) => onDragOver(event, obj)}
              onDrop={(event) => onDrop(event, obj)}
              onDragEnd={endDrag}
              onClick={(event) => select(obj, event)}
              className={cn(
                "group/row flex h-9 cursor-pointer items-center gap-1 rounded-md px-2 transition-colors",
                active
                  ? "bg-muted/80 text-foreground dark:bg-muted/50"
                  : "hover:bg-muted/60 dark:hover:bg-muted/30",
                hidden && "opacity-50",
                mark === "inside" && "ring-1 ring-foreground",
              )}
            >
              {children ? (
                <button
                  type="button"
                  aria-label={open ? "Collapse" : "Expand"}
                  onDoubleClick={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setCollapsed((current) => {
                      const next = new Set(current);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background/80 hover:text-foreground"
                >
                  <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
                </button>
              ) : null}

              <div
                draggable={!renaming}
                onDragStart={(event) => onDragStart(event, obj)}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  startRename(obj);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 pl-0.5 text-left"
              >
                <Icon className="size-5 shrink-0 stroke-[1.5] text-muted-foreground" />

                {renaming ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                    onBlur={() => commitName(obj)}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitName(obj);
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        setRenamingId(null);
                      }
                    }}
                    placeholder={layerLabel(obj)}
                    className="h-7 min-w-0 flex-1 rounded-md bg-background px-2 text-left text-[13px] text-foreground outline-none ring-1 ring-border/50"
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate px-0.5 text-left text-[13px] font-normal text-foreground">
                    {layerLabel(obj)}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex shrink-0 items-center gap-0.5",
                  !hidden && !locked && "opacity-0 group-hover/row:opacity-100 max-md:opacity-100",
                )}
              >
                <button
                  type="button"
                  aria-label={hidden ? t("show") : t("hide")}
                  title={hidden ? t("show") : t("hide")}
                  onClick={(event) => {
                    event.stopPropagation();
                    setVisibleTargets(obj, hidden);
                  }}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background/70 hover:text-foreground",
                    !hidden && "opacity-0 group-hover/row:opacity-100 max-md:opacity-100",
                  )}
                >
                  {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <button
                  type="button"
                  aria-label={locked ? t("unlock") : t("lock")}
                  title={locked ? t("unlock") : t("lock")}
                  onClick={(event) => {
                    event.stopPropagation();
                    setLockedTargets(obj, !locked);
                  }}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background/70 hover:text-foreground",
                    !locked && "opacity-0 group-hover/row:opacity-100 max-md:opacity-100",
                  )}
                >
                  {locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={t("actionsAria")}
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 hover:bg-background/70 hover:text-foreground group-hover/row:opacity-100 data-[state=open]:bg-muted/60 data-[state=open]:opacity-100"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={6}
                    className="w-52 rounded-2xl p-1.5 text-[13px]"
                  >
                    {!multi ? (
                      <DropdownMenuItem className={menuItem} onSelect={() => startRename(obj)}>
                        <Pencil className="size-4" />
                        {t("rename")}
                      </DropdownMenuItem>
                    ) : null}
                    {!multi ? (
                      <DropdownMenuItem className={menuItem} onSelect={() => duplicate(obj)}>
                        <Copy className="size-4" />
                        {t("duplicate")}
                        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    ) : null}
                    {!multi ? <DropdownMenuSeparator className="my-1 bg-border/50" /> : null}
                    {!multi ? (
                      <>
                        <DropdownMenuItem
                          className={menuItem}
                          onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "front"))}
                        >
                          <BringToFrontIcon className="size-5" />
                          {t("bringToFront")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={menuItem}
                          onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "forward"))}
                        >
                          <BringForwardIcon className="size-5" />
                          {t("bringForward")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={menuItem}
                          onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "backward"))}
                        >
                          <SendBackwardIcon className="size-5" />
                          {t("sendBackward")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={menuItem}
                          onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "back"))}
                        >
                          <SendToBackIcon className="size-5" />
                          {t("sendToBack")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-border/50" />
                      </>
                    ) : null}
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => setVisibleTargets(obj, hidden)}
                    >
                      {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      {hidden ? t("show") : t("hide")}
                      {multi ? (
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {selectedSet.size}
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => setLockedTargets(obj, !locked)}
                    >
                      {locked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                      {locked ? t("unlock") : t("lock")}
                      {multi ? (
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {selectedSet.size}
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                    {!multi && isLayerGroup(obj) ? (
                      <DropdownMenuItem
                        className={menuItem}
                        onSelect={() => {
                          if (!manager) return;
                          manager.selectObject(obj);
                          manager.transact(() => ungroupSelection(manager.canvas));
                        }}
                      >
                        <Ungroup className="size-4" />
                        {t("ungroup")}
                        <DropdownMenuShortcut>⇧⌘G</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator className="my-1 bg-border/50" />
                    <DropdownMenuItem
                      variant="destructive"
                      className={cn(menuItem, "text-destructive focus:text-destructive")}
                      onSelect={() => deleteTargets(obj)}
                    >
                      <Trash2 className="size-4" />
                      {t("delete")}
                      {multi ? (
                        <span className="ml-auto text-[11px] tabular-nums opacity-80">
                          {selectedSet.size}
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
