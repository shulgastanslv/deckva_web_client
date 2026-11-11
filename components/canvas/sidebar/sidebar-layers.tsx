"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Eye,
  EyeOff,
  Folder,
  Image as ImageIcon,
  Lock,
  MoreHorizontal,
  Pencil,
  Square,
  Trash2,
  Type,
  Unlock,
  Ungroup,
} from "lucide-react";
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
import { useCanvasManager } from "@/context/canvas-manager";
import { useCanvasObjects } from "@/hooks/use-canvas-objects";
import { ungroupSelection } from "@/lib/canvas/group";
import {
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

export function SidebarLayers() {
  const manager = useCanvasManager();
  const objects = useCanvasObjects();
  const [selected, setSelected] = useState<FabricObject | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [drop, setDrop] = useState<DropMark | null>(null);
  const dragging = useRef<FabricObject | null>(null);

  useEffect(() => {
    if (!manager) return;
    setSelected(manager.getActiveObject());
    return manager.on("selection", (object) => setSelected(object));
  }, [manager]);

  useEffect(() => {
    prepareGroups(objects);
  }, [objects]);

  const rows = flatten(objects, collapsed);

  const run = (work: () => boolean | void) => {
    manager?.transact(work);
  };

  const select = (obj: FabricObject, shift: boolean) => {
    if (!manager) return;
    const canvas = manager.canvas;
    const current = canvas.getActiveObject();
    if (
      shift &&
      current &&
      current !== obj &&
      layerParent(current) === layerParent(obj) &&
      current.type !== "activeselection"
    ) {
      canvas.discardActiveObject();
      canvas.setActiveObject(new ActiveSelection([current, obj], { canvas }));
    } else if (shift && current?.type === "activeselection" && layerParent(obj) === null) {
      const members = (current as ActiveSelection).getObjects().filter((item) => layerParent(item) === null);
      if (!members.includes(obj)) {
        canvas.discardActiveObject();
        canvas.setActiveObject(new ActiveSelection([...members, obj], { canvas }));
      }
    } else {
      canvas.setActiveObject(obj);
    }
    canvas.requestRenderAll();
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
      (cloned as LayerObject).swibpId = globalThis.crypto.randomUUID();
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
          No objects yet. Add elements from the Elements tab.
        </p>
      )}

      {rows.map(({ obj, depth }) => {
        const id = ensureLayerId(obj);
        const children = isLayerGroup(obj) ? obj.getObjects().some(isUserLayer) : false;
        const open = !collapsed.has(id);
        const hidden = obj.visible === false;
        const locked = isLayerLocked(obj);
        const active = isRowSelected(selected, obj);
        const renaming = renamingId === id;
        const Icon = layerGlyph(obj);
        const mark = drop?.id === id ? drop.edge : null;
        const menuItem =
          "cursor-pointer gap-2 rounded-xl px-2 py-1.5 text-[13px] text-foreground focus:bg-muted/50 focus:text-foreground";

        return (
          <div key={id} className="relative" style={{ paddingLeft: depth * 12 }}>
            {mark === "before" && <div className="absolute inset-x-1 top-0 z-10 h-0.5 rounded-md bg-foreground" />}
            {mark === "after" && <div className="absolute inset-x-1 bottom-0 z-10 h-0.5 rounded-md bg-foreground" />}
            <div
              onDragOver={(event) => onDragOver(event, obj)}
              onDrop={(event) => onDrop(event, obj)}
              onDragEnd={endDrag}
              onClick={(event) => select(obj, event.shiftKey)}
              className={cn(
                "group/row flex h-9 cursor-pointer items-center gap-1 rounded-md px-1 pr-1 transition-colors",
                active
                  ? "bg-muted/80 text-foreground dark:bg-muted/50"
                  : "hover:bg-muted/60 dark:hover:bg-muted/30",
                hidden && "opacity-50",
                mark === "inside" && "ring-1 ring-foreground",
              )}
            >
              <button
                type="button"
                aria-label={open ? "Collapse" : "Expand"}
                disabled={!children}
                onDoubleClick={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!children) return;
                  setCollapsed((current) => {
                    const next = new Set(current);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground",
                  children && "hover:bg-background/80 hover:text-foreground",
                  !children && "invisible",
                )}
              >
                <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
              </button>

              <div
                draggable={!renaming}
                onDragStart={(event) => onDragStart(event, obj)}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  startRename(obj);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
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
                    className="h-7 min-w-0 flex-1 rounded-md bg-background px-1.5 text-left text-[13px] text-foreground outline-none ring-1 ring-border/50"
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium text-foreground">
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
                  aria-label={hidden ? "Show" : "Hide"}
                  title={hidden ? "Show" : "Hide"}
                  onClick={(event) => {
                    event.stopPropagation();
                    run(() => setLayerVisible(obj, hidden));
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
                  aria-label={locked ? "Unlock" : "Lock"}
                  title={locked ? "Unlock" : "Lock"}
                  onClick={(event) => {
                    event.stopPropagation();
                    run(() => setLayerLocked(obj, !locked));
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
                      aria-label="Layer actions"
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
                    <DropdownMenuItem className={menuItem} onSelect={() => startRename(obj)}>
                      <Pencil className="size-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className={menuItem} onSelect={() => duplicate(obj)}>
                      <Copy className="size-4" />
                      Duplicate
                      <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-border/50" />
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "front"))}
                    >
                      <ChevronsUp className="size-4" />
                      Bring to front
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "forward"))}
                    >
                      <ChevronUp className="size-4" />
                      Bring forward
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "backward"))}
                    >
                      <ChevronDown className="size-4" />
                      Send backward
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => run(() => moveLayerStep(manager!.canvas, obj, "back"))}
                    >
                      <ChevronsDown className="size-4" />
                      Send to back
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-border/50" />
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => run(() => setLayerVisible(obj, hidden))}
                    >
                      {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      {hidden ? "Show" : "Hide"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={menuItem}
                      onSelect={() => run(() => setLayerLocked(obj, !locked))}
                    >
                      {locked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                      {locked ? "Unlock" : "Lock"}
                    </DropdownMenuItem>
                    {isLayerGroup(obj) && (
                      <DropdownMenuItem
                        className={menuItem}
                        onSelect={() => {
                          if (!manager) return;
                          manager.selectObject(obj);
                          manager.transact(() => ungroupSelection(manager.canvas));
                        }}
                      >
                        <Ungroup className="size-4" />
                        Ungroup
                        <DropdownMenuShortcut>⇧⌘G</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1 bg-border/50" />
                    <DropdownMenuItem
                      variant="destructive"
                      className={cn(menuItem, "text-destructive focus:text-destructive")}
                      onSelect={() => run(() => removeLayer(manager!.canvas, obj))}
                    >
                      <Trash2 className="size-4" />
                      Delete
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
