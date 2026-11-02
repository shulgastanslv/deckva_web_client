"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { AuthModal } from "@/components/auth";
import { FontSelect } from "@/components/canvas/font-select";
import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { StudioSectionHeader } from "@/components/studio/ui/studio-section-header";
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

function BrandCard({
  title,
  onClick,
  children,
  className,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const body = (
    <>
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-muted/20 transition-colors group-hover:bg-muted/30">
        {children}
      </div>
      <p className="truncate px-0.5 text-[13px] font-semibold text-foreground">
        {title}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group flex w-full cursor-pointer flex-col gap-2.5 text-left",
          className,
        )}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={cn("group flex w-full flex-col gap-2.5 text-left", className)}>
      {body}
    </div>
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
          <div className="h-40 animate-pulse rounded-2xl bg-muted/20" />
        </StudioContentBody>
      </StudioContent>
    );
  }

  return (
    <StudioContent>
      <StudioContentBody className="pt-6 sm:pt-10">
        <div className="mb-8 flex items-end justify-between gap-3">
          <h1 className="min-w-0 text-[2rem] font-bold tracking-tight text-foreground sm:text-[2.5rem]">
            Brand kit
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-9 rounded-full text-[13px]"
              onClick={() => persist(defaultBrandKit())}
            >
              Reset
            </Button>
            <StudioCreateMenu
              onBlank={create.openBlank}
              onTemplates={create.openTemplates}
              label="Create"
              align="end"
            />
          </div>
        </div>

        <section>
          <StudioSectionHeader title="Colors" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {PALETTE_SLOTS.map((slot) => (
              <BrandCard key={slot.id} title={slot.label}>
                <div className="flex size-full flex-col justify-between p-3 sm:p-4">
                  <div
                    className="h-full min-h-16 flex-1 rounded-xl"
                    style={{ backgroundColor: kit.palette[slot.id] }}
                  />
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <ColorPicker
                      compact
                      caption={
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {kit.palette[slot.id]}
                        </span>
                      }
                      value={kit.palette[slot.id]}
                      onChange={(hex) => setPaletteSlot(slot.id, hex)}
                    />
                  </div>
                </div>
              </BrandCard>
            ))}
          </div>
        </section>

        <div className="h-8 sm:h-10" aria-hidden />

        <section>
          <StudioSectionHeader title="Fonts" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {TEXT_STYLES.map((style) => (
              <BrandCard key={style.id} title={style.label}>
                <div className="flex size-full flex-col justify-between gap-3 p-4">
                  <p
                    className="line-clamp-2 text-[22px] leading-tight text-foreground sm:text-[26px]"
                    style={{
                      fontFamily: kit.textStyles[style.id].fontFamily,
                      fontWeight: kit.textStyles[style.id].fontWeight,
                    }}
                  >
                    The quick brown fox
                  </p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FontSelect
                      value={kit.textStyles[style.id].fontFamily}
                      onChange={(family) => setTextStyleFont(style.id, family)}
                    />
                  </div>
                </div>
              </BrandCard>
            ))}
          </div>
        </section>

        <div className="h-8 sm:h-10" aria-hidden />

        <section>
          <StudioSectionHeader title="Logos" />
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            <BrandCard title="Upload logo" onClick={openLogoPicker}>
              <span className="flex size-full flex-col items-center justify-center gap-2 bg-background text-muted-foreground ring-1 ring-inset ring-border/70">
                <Plus className="size-7 stroke-[1.5]" />
              </span>
            </BrandCard>

            {kit.logos.map((logo) => (
              <div key={logo.id} className="group flex flex-col gap-2.5">
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-muted/20 p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.dataUrl}
                    alt={logo.name}
                    className="size-full object-contain"
                  />
                  <button
                    type="button"
                    title="Remove logo"
                    onClick={() => removeLogo(logo.id)}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground opacity-100 transition-opacity hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <p className="truncate px-0.5 text-[13px] font-semibold text-foreground">
                  {logo.name}
                </p>
              </div>
            ))}

            {kit.logos.length === 0 ? (
              <BrandCard title="Wordmark" onClick={openLogoPicker}>
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <ImagePlus className="size-6 stroke-[1.5]" />
                </span>
              </BrandCard>
            ) : null}
          </div>
        </section>
      </StudioContentBody>

      <AuthModal
        isOpen={authOpen || create.authNeeded}
        onOpenChange={(open) => {
          setAuthOpen(open);
          if (!open) create.setAuthNeeded(false);
        }}
      />
    </StudioContent>
  );
}
