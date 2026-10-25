"use client";

import React, { ReactNode, useState } from "react";
import {
  FilterIcon,
  ImageIcon,
  LayersIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShapesIcon,
  Sparkles,
  StickyNoteIcon,
  ToolCase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarElements } from "@/components/canvas/sidebar/sidebar-elements";
import { SidebarLayers } from "@/components/canvas/sidebar/sidebar-layers";
import { SidebarSettings } from "@/components/canvas/sidebar/sidebar-settings";
import { SidebarBackground } from "@/components/canvas/sidebar/sidebar-background";
import { SidebarFilters } from "./sidebar/sidebar-filters";
import { LegalDialog, type LegalKind } from "@/components/legal-dialog";
import { SidebarIcons } from "./sidebar/sidebar-icons";
import { SidebarTools } from "./sidebar/sidebar-tools";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type NavId =
  | "elements"
  | "layers"
  | "settings"
  | "filters"
  | "icons"
  | "background"
  | "tools"

export const RAIL_SHORTCUTS: NavId[] = [
  "tools",
  "elements",
  "layers",
  "background",
  "filters",
  "icons",
];

interface LeftSidebarProps {
  activeNav: NavId;
  setActiveNav: (nav: NavId) => void;
  isLeftCollapsed: boolean;
  setIsLeftCollapsed: (v: boolean) => void;
  showDotGrid: boolean;
  setShowDotGrid: (v: boolean) => void;
}

function RailTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

const PANEL_TITLES: Record<NavId, string> = {
  elements: "Canvas Elements",
  layers: "Layers",
  settings: "Settings",
  icons: "Icons",
  filters: "Filters",
  background: "Background",
  tools: "Tools",
};

export function LeftSidebar({
  activeNav,
  setActiveNav,
  isLeftCollapsed,
  setIsLeftCollapsed,
  showDotGrid,
  setShowDotGrid,
}: LeftSidebarProps) {
  const [legal, setLegal] = useState<LegalKind | null>(null);

  const navItems: { id: NavId; icon: ReactNode; label: string }[] = [
    { id: "elements", icon: <ShapesIcon className="size-[18px] stroke-[1.5]" />, label: "Elements" },
    { id: "tools", icon: <ToolCase className="size-[18px] stroke-[1.5]" />, label: "Tools" },
    { id: "layers", icon: <LayersIcon className="size-[18px] stroke-[1.5]" />, label: "Layers" },
    { id: "background", icon: <ImageIcon className="size-[18px] stroke-[1.5]" />, label: "Background" },
    { id: "filters", icon: <FilterIcon className="size-[18px] stroke-[1.5]" />, label: "Filter" },
    { id: "icons", icon: <StickyNoteIcon className="size-[18px] stroke-[1.5]" />, label: "Icons" },
  ];

  return (
    <div className="flex h-full min-h-0 overflow-hidden border-r border-border bg-background">
      <aside className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-border/50 bg-muted/20 py-3">
        <TooltipProvider delayDuration={300}>
          <div className="flex flex-col gap-1.5">
            {navItems.map(({ id, icon: Icon, label }, index) => (
              <RailTooltip key={id} label={`Key: ${index + 1} - ${label}`}>
                <Button
                  variant={activeNav === id ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-full text-[13px] font-medium tracking-tight hover:text-foreground"
                  aria-label={label}
                  onClick={() => {
                    setActiveNav(id);
                    if (isLeftCollapsed) setIsLeftCollapsed(false);
                  }}
                >
                  {Icon}
                </Button>
              </RailTooltip>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <RailTooltip label={isLeftCollapsed ? "Expand panel" : "Collapse panel"}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label={isLeftCollapsed ? "Expand panel" : "Collapse panel"}
                onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              >
                {isLeftCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </RailTooltip>

            <RailTooltip label="Settings">
              <Button
                variant={activeNav === "settings" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Settings"
                onClick={() => {
                  setActiveNav("settings");
                  if (isLeftCollapsed) setIsLeftCollapsed(false);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </RailTooltip>
          </div>
        </TooltipProvider>
      </aside>

      <div
        className={`flex min-h-0 min-w-0 flex-col overflow-hidden transition-all duration-200 ease-in-out ${
          isLeftCollapsed ? "w-0 opacity-0" : "w-72 opacity-100"
        }`}
      >
        <div className="flex h-8 shrink-0 items-center border-b border-border/40 px-4 text-[13px] font-semibold tracking-tight text-foreground">
          {PANEL_TITLES[activeNav] ?? activeNav}
        </div>

        <ScrollArea className="h-full min-h-0 w-full flex-1 p-2 [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden">
          {activeNav === "elements" && <SidebarElements />}
          {activeNav === "layers" && <SidebarLayers />}
          {activeNav === "filters" && <SidebarFilters />}
          {activeNav === "icons" && <SidebarIcons />}
          {activeNav === "settings" && (
            <SidebarSettings
              showDotGrid={showDotGrid}
              setShowDotGrid={setShowDotGrid}
            />
          )}
          {activeNav === "background" && <SidebarBackground />}
          {activeNav === "tools" && <SidebarTools />}
        </ScrollArea>
        <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/40 px-4 py-2 text-[13px] text-muted-foreground">
          <button
            type="button"
            onClick={() => setLegal("terms")}
            className="transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            Terms of Service
          </button>
          <span className="text-muted-foreground/40">•</span>
          <button
            type="button"
            onClick={() => setLegal("privacy")}
            className="transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            Privacy Policy
          </button>
        </div>
      </div>

      <LegalDialog
        kind={legal ?? "terms"}
        open={legal !== null}
        onOpenChange={(open) => {
          if (!open) setLegal(null);
        }}
      />
    </div>
  );
}
