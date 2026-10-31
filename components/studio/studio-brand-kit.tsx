"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { AuthModal } from "@/components/auth";
import { FontSelect } from "@/components/canvas/font-select";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { StudioPageHeader } from "@/components/studio/ui/studio-page-header";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  BRAND_KIT_STORAGE_KEY,
  defaultBrandKit,
  readBrandKit,
  writeBrandKit,
  type BrandKit,
  type BrandKitColor,
  type BrandKitLogo,
} from "@/lib/studio/brand-kit";
import { cn } from "@/lib/utils";

export function StudioBrandKit() {
  const { status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [kit, setKit] = useState<BrandKit>(defaultBrandKit);
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

  const updateColor = (id: string, patch: Partial<BrandKitColor>) => {
    persist({
      ...kit,
      colors: kit.colors.map((color) =>
        color.id === id ? { ...color, ...patch } : color,
      ),
    });
  };

  const addColor = () => {
    const id = `color-${Date.now()}`;
    persist({
      ...kit,
      colors: [...kit.colors, { id, name: "Color", hex: "#64748b" }],
    });
  };

  const removeColor = (id: string) => {
    if (kit.colors.length <= 1) return;
    persist({ ...kit, colors: kit.colors.filter((c) => c.id !== id) });
  };

  const setFontAt = (index: number, family: string) => {
    const fonts = [...kit.fonts];
    fonts[index] = family;
    persist({ ...kit, fonts });
  };

  const addFont = () => {
    persist({ ...kit, fonts: [...kit.fonts, "Inter"] });
  };

  const removeFont = (index: number) => {
    persist({ ...kit, fonts: kit.fonts.filter((_, i) => i !== index) });
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

  if (!ready) {
    return (
      <StudioContent>
        <StudioContentBody>
          <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
        </StudioContentBody>
      </StudioContent>
    );
  }

  return (
    <StudioContent>
      <StudioContentBody>
        <StudioPageHeader
          title="Brand kit"
          actions={
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full text-[13px]"
              onClick={() => persist(defaultBrandKit())}
            >
              Reset defaults
            </Button>
          }
        />

        <div className="flex flex-col gap-10">
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Colors</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Palette slots you reuse across carousels.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 rounded-full text-[13px]"
                onClick={addColor}
              >
                <Plus className="size-3.5" />
                Add color
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {kit.colors.map((color) => (
                <div
                  key={color.id}
                  className="flex items-end gap-2 rounded-2xl bg-muted/30 p-3"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      value={color.name}
                      onChange={(e) => updateColor(color.id, { name: e.target.value })}
                      className="h-8 rounded-full border-0 bg-background/70 text-[13px] shadow-none"
                    />
                    <ColorPicker
                      value={color.hex}
                      onChange={(hex) => updateColor(color.id, { hex })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-full text-muted-foreground"
                    disabled={kit.colors.length <= 1}
                    onClick={() => removeColor(color.id)}
                    title="Remove color"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Fonts</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Brand typefaces for headings and body.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 rounded-full text-[13px]"
                onClick={addFont}
              >
                <Plus className="size-3.5" />
                Add font
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {kit.fonts.map((font, index) => (
                <div
                  key={`${font}-${index}`}
                  className="flex items-center gap-2 rounded-2xl bg-muted/30 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <FontSelect
                      value={font}
                      onChange={(family) => setFontAt(index, family)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-full text-muted-foreground"
                    disabled={kit.fonts.length <= 1}
                    onClick={() => removeFont(index)}
                    title="Remove font"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Logos</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Wordmarks and marks for your carousels.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 rounded-full text-[13px]"
                onClick={() => {
                  if (status !== "authenticated") {
                    setAuthOpen(true);
                    return;
                  }
                  logoInputRef.current?.click();
                }}
              >
                <ImagePlus className="size-3.5" />
                Upload
              </Button>
            </div>
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
            {kit.logos.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (status !== "authenticated") {
                    setAuthOpen(true);
                    return;
                  }
                  logoInputRef.current?.click();
                }}
                className={cn(
                  "flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/20 text-[13px] text-muted-foreground transition-colors",
                  "hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <ImagePlus className="size-5" />
                Upload logo
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {kit.logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="group relative flex aspect-square items-center justify-center rounded-2xl bg-muted/30 p-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.dataUrl}
                      alt={logo.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      type="button"
                      title="Remove logo"
                      onClick={() => removeLogo(logo.id)}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </StudioContentBody>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </StudioContent>
  );
}
