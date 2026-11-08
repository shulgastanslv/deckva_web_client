"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, RotateCcw } from "lucide-react";
import { useSession } from "next-auth/react";

import { AuthModal } from "@/components/auth";
import { FontSelect } from "@/components/canvas/font-select";
import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  PALETTE_SLOTS,
  TEXT_STYLES,
  type PaletteSlot,
  type TextStyleId,
} from "@/lib/canvas/document";
import {
  BRAND_KIT_STORAGE_KEY,
  defaultBrandKit,
  readBrandKit,
  updateBrandTextStyle,
  writeBrandKit,
  type BrandKit,
  type BrandKitLogo,
} from "@/lib/studio/brand-kit";
import { cn } from "@/lib/utils";

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 py-8 border-t border-border/40 first:border-0 first:pt-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-[17px] font-medium tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-[13px] text-muted-foreground max-w-xl">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function ItemCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-muted/40 transition-colors border-none shadow-none",
        onClick && "cursor-pointer hover:bg-muted/60",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function StudioBrandKit() {
  const { status } = useSession();
  const create = useStudioCreate();
  const [authOpen, setAuthOpen] = useState(false);
  const [kit, setKit] = useState<BrandKit>(() => defaultBrandKit());
  const [ready, setReady] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setKit(readBrandKit(window.localStorage.getItem(BRAND_KIT_STORAGE_KEY)));
    setReady(true);
  }, []);

  const persist = (next: BrandKit) => {
    setKit(next);
    writeBrandKit(next);
  };

  const setPaletteSlot = (slot: PaletteSlot, hex: string) => {
    persist({
      ...kit,
      palette: { ...kit.palette, [slot]: hex },
    });
  };

  const setTextStyleFont = (id: TextStyleId, fontFamily: string) => {
    persist(updateBrandTextStyle(kit, id, { fontFamily }));
  };

  const addLogos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    const logos: BrandKitLogo[] = [...kit.logos];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await fileToDataUrl(file);
      logos.unshift({
        id: `logo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name.replace(/\.[^.]+$/, "") || "Logo",
        dataUrl,
      });
    }
    persist({ ...kit, logos: logos.slice(0, 24) });
  };

  const removeLogo = (id: string) => {
    persist({ ...kit, logos: kit.logos.filter((logo) => logo.id !== id) });
  };

  const openLogoPicker = () => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    logoInputRef.current?.click();
  };

  if (!ready) {
    return (
      <StudioContent>
        <StudioContentBody>
          <div className="mx-auto w-full max-w-4xl pt-12">
            <div className="h-10 w-48 animate-pulse rounded-full bg-muted/40 mb-12" />
            <div className="space-y-12">
              <div className="h-32 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-48 animate-pulse rounded-2xl bg-muted/40" />
            </div>
          </div>
        </StudioContentBody>
      </StudioContent>
    );
  }

  return (
    <StudioContent>
      <StudioContentBody className="pt-6 sm:pt-10">
        <div className="flex flex-col">
          
          {/* Header Area */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                Brand kit
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground">
                Set up your brand kit for your projects. This will be available across all your projects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-full bg-muted/40 px-4 text-[13px] shadow-none hover:bg-muted/60"
                onClick={() => persist(defaultBrandKit())}
              >
                <RotateCcw className="mr-2 size-3.5 opacity-70" />
                Reset
              </Button>
              <StudioCreateMenu
                onBlank={create.openBlank}
                onTemplates={create.openTemplates}
                align="end"
              />
            </div>
          </div>

          <div className="flex flex-col">
            
            {/* Colors Section */}
            <Section 
              title="Colors" 
              description="Define your primary and secondary palette. These colors will be available across all your projects."
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                {PALETTE_SLOTS.map((slot) => (
                  <div key={slot.id} className="flex flex-col gap-2.5">
                    <ItemCard className="aspect-square p-2.5">
                      <div
                        className="size-full rounded-xl transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: kit.palette[slot.id] }}
                      />
                    </ItemCard>
                    <div className="px-1 flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-foreground">
                        {slot.label}
                      </span>
                      <ColorPicker
                        compact
                        caption={
                          <span className="font-mono text-[12px] uppercase text-muted-foreground">
                            {kit.palette[slot.id]}
                          </span>
                        }
                        value={kit.palette[slot.id]}
                        onChange={(hex) => setPaletteSlot(slot.id, hex)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Fonts Section */}
            <Section 
              title="Typography"
              description="Choose the default font families for different text styles in your presentations."
            >
              <div className="flex flex-col gap-2">
                {TEXT_STYLES.map((style) => (
                  <div 
                    key={style.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-muted/20 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-col gap-1 sm:w-1/3">
                      <span className="text-[13px] font-medium text-muted-foreground">
                        {style.label}
                      </span>
                      <p
                        className="truncate text-[22px] text-foreground"
                        style={{
                          fontFamily: kit.textStyles[style.id].fontFamily,
                          fontWeight: kit.textStyles[style.id].fontWeight,
                        }}
                      >
                        Ag
                      </p>
                    </div>
                    <div className="sm:w-2/3 max-w-sm">
                      <FontSelect
                        value={kit.textStyles[style.id].fontFamily}
                        onChange={(family) => setTextStyleFont(style.id, family)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Logos Section */}
            <Section 
              title="Logos & Assets"
              description="Upload your company logos, watermarks, or frequently used graphics to access them quickly."
              action={
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 rounded-full bg-muted/40 px-4 text-[13px] shadow-none hover:bg-muted/60"
                  onClick={openLogoPicker}
                >
                  <Plus className="mr-2 size-3.5" />
                  Upload logo
                </Button>
              }
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void addLogos(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 mt-2">
                <ItemCard 
                  onClick={openLogoPicker}
                  className="aspect-square text-muted-foreground border border-dashed border-border/60 bg-transparent hover:bg-muted/20 hover:border-border"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="size-6 opacity-70" />
                    <span className="text-[12px] font-medium">Add new</span>
                  </div>
                </ItemCard>

                {kit.logos.map((logo) => (
                  <div key={logo.id} className="group relative flex flex-col gap-2.5">
                    <ItemCard className="aspect-square p-4 bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo.dataUrl}
                        alt={logo.name}
                        className="size-full object-contain transition-transform group-hover:scale-95"
                      />
                      <button
                        type="button"
                        title="Remove logo"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLogo(logo.id);
                        }}
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-all hover:text-destructive hover:bg-background shadow-sm group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </ItemCard>
                    <span className="truncate px-1 text-center text-[12px] font-medium text-muted-foreground">
                      {logo.name}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        </div>
      </StudioContentBody>

      <AuthModal
        isOpen={authOpen}
        onOpenChange={(open) => {
          setAuthOpen(open);
        }}
      />
    </StudioContent>
  );
}