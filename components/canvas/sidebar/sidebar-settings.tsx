"use client";

import { useCanvasStore } from "@/store/useCanvasStore";
import { sidebarPanel } from "@/components/canvas/sidebar/sidebar-ui";

const STORAGE_KEY = "swibp.autosave";

interface SidebarSettingsProps {
  showDotGrid: boolean;
  setShowDotGrid: (v: boolean) => void;
}

export function SidebarSettings({ showDotGrid, setShowDotGrid }: SidebarSettingsProps) {
  const autoSave = useCanvasStore((state) => state.autoSave);
  const setAutoSave = useCanvasStore((state) => state.setAutoSave);

  return (
    <div className={sidebarPanel}>
      <span className="font-medium text-muted-foreground">Canvas Preferences</span>
      <label className="flex cursor-pointer items-center justify-between rounded-md bg-muted/30 p-2.5">
        <span>Show dot grid background</span>
        <input
          type="checkbox"
          checked={showDotGrid}
          onChange={(e) => setShowDotGrid(e.target.checked)}
          className="accent-primary rounded"
        />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md bg-muted/30 p-2.5">
        <span>
          Autosave
          <span className="mt-0.5 block text-muted-foreground">Saves quietly in the background</span>
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
