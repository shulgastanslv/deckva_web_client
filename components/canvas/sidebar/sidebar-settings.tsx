"use client";

import { useTranslations } from "next-intl";
import { useCanvasStore } from "@/store/useCanvasStore";
import { sidebarPanel, sidebarSurfaceIdle } from "@/components/canvas/sidebar/sidebar-ui";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "swibp.autosave";

interface SidebarSettingsProps {
  showDotGrid: boolean;
  setShowDotGrid: (v: boolean) => void;
}

export function SidebarSettings({ showDotGrid, setShowDotGrid }: SidebarSettingsProps) {
  const autoSave = useCanvasStore((state) => state.autoSave);
  const setAutoSave = useCanvasStore((state) => state.setAutoSave);
  const t = useTranslations("editor.settings");

  return (
    <div className={sidebarPanel}>
      <span className="font-medium text-muted-foreground">{t("title")}</span>
      <label
        className={cn(
          "flex cursor-pointer items-center justify-between rounded-md p-3 text-foreground",
          sidebarSurfaceIdle,
        )}
      >
        <span>{t("dotGrid")}</span>
        <input
          type="checkbox"
          checked={showDotGrid}
          onChange={(e) => setShowDotGrid(e.target.checked)}
          className="accent-primary rounded"
        />
      </label>
      <label
        className={cn(
          "flex cursor-pointer items-center justify-between gap-3 rounded-md p-3 text-foreground",
          sidebarSurfaceIdle,
        )}
      >
        <span>
          {t("autosave")}
          <span className="mt-0.5 block text-muted-foreground">{t("autosaveHint")}</span>
        </span>
        <input
          type="checkbox"
          checked={autoSave}
          onChange={(event) => {
            const enabled = event.target.checked;
            setAutoSave(enabled);
            window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
          }}
          className="accent-primary rounded"
        />
      </label>
    </div>
  );
}
