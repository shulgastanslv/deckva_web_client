"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  sidebarHint,
  sidebarPanel,
  sidebarSurfaceIdle,
} from "@/components/canvas/sidebar/sidebar-ui";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/useCanvasStore";

const STORAGE_KEY = "swibp.autosave";
const CANVASES_KEY = "swibp.showAllCanvases";
const NAV_KEY = "swibp.showSlideNav";

interface SidebarSettingsProps {
  showDotGrid: boolean;
  setShowDotGrid: (v: boolean) => void;
}

function SettingRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-md p-3 text-foreground",
        sidebarSurfaceIdle,
      )}
    >
      <span className="min-w-0">
        {label}
        {hint ? <span className={cn("mt-0.5 block", sidebarHint)}>{hint}</span> : null}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-16 rounded-md border-none bg-muted/40 px-2 text-center text-[13px] tabular-nums shadow-none"
      />
    </div>
  );
}

export function SidebarSettings({ showDotGrid, setShowDotGrid }: SidebarSettingsProps) {
  const autoSave = useCanvasStore((state) => state.autoSave);
  const setAutoSave = useCanvasStore((state) => state.setAutoSave);
  const showAllCanvases = useCanvasStore((s) => s.showAllCanvases);
  const setShowAllCanvases = useCanvasStore((s) => s.setShowAllCanvases);
  const showSlideNav = useCanvasStore((s) => s.showSlideNav);
  const setShowSlideNav = useCanvasStore((s) => s.setShowSlideNav);

  const autoFlowEnabled = useCanvasStore((s) => s.autoFlowEnabled);
  const autoFlowEdgeTolerance = useCanvasStore((s) => s.autoFlowEdgeTolerance);
  const autoFlowPadding = useCanvasStore((s) => s.autoFlowPadding);
  const setAutoFlowEnabled = useCanvasStore((s) => s.setAutoFlowEnabled);
  const setAutoFlowEdgeTolerance = useCanvasStore((s) => s.setAutoFlowEdgeTolerance);
  const setAutoFlowPadding = useCanvasStore((s) => s.setAutoFlowPadding);

  const isGridVisible = useCanvasStore((s) => s.isGridVisible);
  const gridColumns = useCanvasStore((s) => s.gridColumns);
  const gridRows = useCanvasStore((s) => s.gridRows);
  const gridMargin = useCanvasStore((s) => s.gridMargin);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);
  const setGridVisible = useCanvasStore((s) => s.setGridVisible);
  const setGridColumns = useCanvasStore((s) => s.setGridColumns);
  const setGridRows = useCanvasStore((s) => s.setGridRows);
  const setGridMargin = useCanvasStore((s) => s.setGridMargin);
  const setSnapToGrid = useCanvasStore((s) => s.setSnapToGrid);

  const t = useTranslations("editor.settings");
  const tg = useTranslations("editor.grid");
  const tf = useTranslations("editor.toolbar");

  return (
    <div className={sidebarPanel}>
      <span className="font-medium text-muted-foreground">{t("title")}</span>

      <SettingRow
        label={t("dotGrid")}
        checked={showDotGrid}
        onCheckedChange={setShowDotGrid}
      />

      <SettingRow
        label={t("layoutGrid")}
        hint={t("layoutGridHint")}
        checked={isGridVisible}
        onCheckedChange={setGridVisible}
      />
      <div
        className={cn(
          "flex flex-col gap-2.5 rounded-md px-3 pb-1 transition-opacity",
          !isGridVisible && "pointer-events-none opacity-50",
        )}
      >
        <NumberField
          label={tg("columns")}
          value={gridColumns}
          onChange={setGridColumns}
          max={24}
        />
        <NumberField
          label={tg("rows")}
          value={gridRows}
          onChange={setGridRows}
          max={24}
        />
        <NumberField
          label={tg("margin")}
          value={gridMargin}
          onChange={setGridMargin}
          max={400}
        />
        <SettingRow
          label={tg("snap")}
          hint={tg("snapHint")}
          checked={snapToGrid}
          onCheckedChange={setSnapToGrid}
        />
      </div>

      <SettingRow
        label={t("autoFlow")}
        hint={t("autoFlowHint")}
        checked={autoFlowEnabled}
        onCheckedChange={setAutoFlowEnabled}
      />
      <div
        className={cn(
          "flex flex-col gap-2.5 rounded-md px-3 pb-1 transition-opacity",
          !autoFlowEnabled && "pointer-events-none opacity-50",
        )}
      >
        <NumberField
          label={tf("edge")}
          value={autoFlowEdgeTolerance}
          onChange={setAutoFlowEdgeTolerance}
          max={64}
        />
        <NumberField
          label={tf("padding")}
          value={autoFlowPadding}
          onChange={setAutoFlowPadding}
          max={200}
        />
      </div>

      <SettingRow
        label={t("allCanvases")}
        hint={t("allCanvasesHint")}
        checked={showAllCanvases}
        onCheckedChange={(enabled) => {
          setShowAllCanvases(enabled);
          window.localStorage.setItem(CANVASES_KEY, enabled ? "1" : "0");
        }}
      />

      <SettingRow
        label={t("slideNav")}
        hint={t("slideNavHint")}
        checked={showSlideNav}
        onCheckedChange={(enabled) => {
          setShowSlideNav(enabled);
          window.localStorage.setItem(NAV_KEY, enabled ? "1" : "0");
        }}
      />

      <SettingRow
        label={t("autosave")}
        hint={t("autosaveHint")}
        checked={autoSave}
        onCheckedChange={(enabled) => {
          setAutoSave(enabled);
          window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
        }}
      />
    </div>
  );
}
