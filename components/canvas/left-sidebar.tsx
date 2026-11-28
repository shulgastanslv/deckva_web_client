"use client";

import React, { ReactNode, useState } from "react";
import {
  Code,
  FrameCorners,
  Image as ImageIcon,
  ImagesSquare,
  Stack as LayersIcon,
  SidebarSimple as PanelLeftClose,
  Sidebar as PanelLeftOpen,
  Parallelogram,
  ArrowClockwise as Redo2,
  Gear as Settings,
  Package,
  PaletteIcon as Palette,
  TextT,
  ArrowCounterClockwise as Undo2,
  Triangle,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Logo from "@/components/logo/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarElements } from "@/components/canvas/sidebar/sidebar-elements";
import { SidebarLayers } from "@/components/canvas/sidebar/sidebar-layers";
import { SidebarSettings } from "@/components/canvas/sidebar/sidebar-settings";
import { SidebarBackground } from "@/components/canvas/sidebar/sidebar-background";
import { LegalDialog, type LegalKind } from "@/components/legal-dialog";
import { CanvasNavHint } from "@/components/canvas/canvas-nav-hint";
import { ProjectFileMenu } from "@/components/canvas/project-file-menu";
import { SaveStatusMenu } from "@/components/canvas/save-status-menu";
import { ChangeHistoryMenu } from "@/components/canvas/change-history-menu";
import { SidebarAssets } from "./sidebar/sidebar-assets";
import {
  navIconClass,
  sidebarFloatShell,
} from "@/components/canvas/sidebar/sidebar-ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanvasManager } from "@/context/canvas-manager";
import { cn } from "@/lib/utils";
import { Shapes } from "lucide-react";

export type NavId =
  | "frames"
  | "text"
  | "shapes"
  | "code"
  | "photos"
  | "layers"
  | "settings"
  | "assets"
  | "background";

export const ELEMENT_PAGES = ["text", "photos", "shapes", "frames", "code"] as const;
export type ElementPage = (typeof ELEMENT_PAGES)[number];

export function isElementPage(id: NavId): id is ElementPage {
  return (ELEMENT_PAGES as readonly string[]).includes(id);
}

export const RAIL_SHORTCUTS: NavId[] = [
  "text",
  "photos",
  "shapes",
  "frames",
  "code",
  "layers",
  "background",
  "assets",
  "settings",
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

const railBtn =
  "size-10 rounded-md border-none text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground";

export function LeftSidebar({
  activeNav,
  setActiveNav,
  isLeftCollapsed,
  setIsLeftCollapsed,
  showDotGrid,
  setShowDotGrid,
}: LeftSidebarProps) {
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const manager = useCanvasManager();
  const t = useTranslations("editor.panels");
  const te = useTranslations("editor.elements");
  const tc = useTranslations("common");

  const panelTitles: Record<NavId, string> = {
    frames: te("frames"),
    text: te("text"),
    shapes: te("shapes"),
    code: te("code"),
    photos: te("photos"),
    layers: t("layers"),
    settings: t("settings"),
    assets: t("assets"),
    background: t("background"),
  };

  const navItems: { id: NavId; icon: ReactNode; label: string }[] = [
    { id: "text", icon: <TextT className={navIconClass} />, label: te("text") },
    { id: "photos", icon: <ImagesSquare className={navIconClass} />, label: te("photos") },
    { id: "shapes", icon: <Shapes className={navIconClass} />, label: te("shapes") },
    { id: "frames", icon: <FrameCorners className={navIconClass} />, label: te("frames") },
    { id: "code", icon: <Code className={navIconClass} />, label: te("code") },
    { id: "layers", icon: <LayersIcon className={navIconClass} />, label: t("layers") },
    { id: "background", icon: <Palette className={navIconClass} />, label: t("background") },
    { id: "assets", icon: <Package className={navIconClass} />, label: t("assets") },
  ];

  const openNav = (id: NavId) => {
    setActiveNav(id);
    if (isLeftCollapsed) setIsLeftCollapsed(false);
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full overflow-hidden max-md:border-0 md:w-auto",
        sidebarFloatShell,
      )}
    >
      <aside
        data-tour="editorRail"
        className="flex w-14 shrink-0 flex-col items-center justify-between bg-transparent py-3 max-md:py-2 md:bg-background md:py-4"
      >
        <TooltipProvider delayDuration={300}>
          <div className="flex flex-col items-center gap-1.5">
            <Logo
              width={36}
              height={36}
              href="/studio"
              className="mb-1.5 hidden md:block"
            />
            {navItems.map(({ id, icon: Icon, label }, index) => (
              <RailTooltip key={id} label={`${label} (${index + 1})`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    railBtn,
                    index === ELEMENT_PAGES.length && "mt-2",
                    activeNav === id &&
                      !isLeftCollapsed &&
                      "bg-muted/60 text-foreground hover:bg-muted/60",
                  )}
                  aria-label={label}
                  aria-pressed={activeNav === id && !isLeftCollapsed}
                  onClick={() => openNav(id)}
                >
                  {Icon}
                </Button>
              </RailTooltip>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="hidden flex-col items-center gap-1.5 md:flex">
              <RailTooltip label={tc("undo")}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={railBtn}
                  aria-label={tc("undo")}
                  onClick={() => void manager?.undo()}
                >
                  <Undo2 className={navIconClass} />
                </Button>
              </RailTooltip>
              <RailTooltip label={tc("redo")}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={railBtn}
                  aria-label={tc("redo")}
                  onClick={() => void manager?.redo()}
                >
                  <Redo2 className={navIconClass} />
                </Button>
              </RailTooltip>
              <RailTooltip label={isLeftCollapsed ? t("expandPanel") : t("collapsePanel")}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={railBtn}
                  aria-label={isLeftCollapsed ? t("expandPanel") : t("collapsePanel")}
                  onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                >
                  {isLeftCollapsed ? (
                    <PanelLeftOpen className={navIconClass} />
                  ) : (
                    <PanelLeftClose className={navIconClass} />
                  )}
                </Button>
              </RailTooltip>
            </div>
            <RailTooltip label={`${t("settings")} (9)`}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  railBtn,
                  activeNav === "settings" &&
                    !isLeftCollapsed &&
                    "bg-muted/60 text-foreground hover:bg-muted/60",
                )}
                aria-label={t("settings")}
                onClick={() => openNav("settings")}
              >
                <Settings className={navIconClass} />
              </Button>
            </RailTooltip>
          </div>
        </TooltipProvider>
      </aside>

      <div
        data-tour="editorElements"
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden transition-all duration-200 ease-in-out py-2 max-md:w-auto max-md:flex-1 max-md:opacity-100",
          isLeftCollapsed ? "md:w-0 md:flex-none md:opacity-0" : "md:w-80 md:flex-none md:opacity-100",
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-3.5">
          <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
            {panelTitles[activeNav] ?? activeNav}
          </h2>
          <div className="flex items-center gap-1">
            <ProjectFileMenu />
            <span className="hidden md:contents">
              <CanvasNavHint />
            </span>
            <ChangeHistoryMenu />
            <SaveStatusMenu />
          </div>
        </div>

        <ScrollArea className="h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden [&_[data-slot=scroll-area-viewport]]:max-w-full [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!min-w-0 [&_[data-slot=scroll-area-viewport]>div]:!max-w-full">
          {isElementPage(activeNav) && <SidebarElements category={activeNav} />}
          {activeNav === "layers" && <SidebarLayers />}
          {activeNav === "assets" && <SidebarAssets />}
          {activeNav === "settings" && (
            <SidebarSettings
              showDotGrid={showDotGrid}
              setShowDotGrid={setShowDotGrid}
            />
          )}
          {activeNav === "background" && <SidebarBackground />}
        </ScrollArea>
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
