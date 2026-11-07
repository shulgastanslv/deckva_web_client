import { cn } from "@/lib/utils";

export type StudioTypeArtKind = "carousel" | "text" | "palette" | "all";

const ACCENTS = ["#4262ff", "#7c5cff", "#0ea5a4", "#f59e0b", "#ec4899"] as const;

function pickAccent(seed: number) {
  return ACCENTS[Math.abs(seed) % ACCENTS.length]!;
}

function ArtShell({
  className,
  seed,
  children,
}: {
  className?: string;
  seed: number;
  children: React.ReactNode;
}) {
  const gradId = `type-art-${seed}`;
  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 overflow-hidden rounded-lg bg-muted/20 text-foreground",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="size-full" xmlns="http://www.w3.org/2000/svg">
       
        {children}
      </svg>
    </span>
  );
}

export function StudioCarouselArt({
  className,
  seed = 0,
}: {
  className?: string;
  seed?: number;
}) {
  const accent = pickAccent(seed);
  return (
    <ArtShell className={className} seed={seed + 11}>
      <rect
        x="18"
        y="12"
        width="28"
        height="36"
        rx="5"
        className="fill-background stroke-border"
        strokeWidth="1.4"
        opacity="0.7"
        transform="rotate(-8 32 30)"
      />
      <rect
        x="16"
        y="14"
        width="30"
        height="38"
        rx="5"
        className="fill-background stroke-border"
        strokeWidth="1.4"
        transform="rotate(6 31 33)"
      />
      <rect x="22" y="22" width="18" height="3" rx="1.5" fill={accent} />
      <rect
        x="22"
        y="28"
        width="22"
        height="2.2"
        rx="1.1"
        className="fill-muted-foreground/35"
      />
      <rect
        x="22"
        y="33"
        width="16"
        height="2.2"
        rx="1.1"
        className="fill-muted-foreground/35"
      />
      <circle cx="40" cy="46" r="3.2" fill={accent} opacity="0.9" />
      <circle cx="47" cy="46" r="3.2" className="fill-muted-foreground/30" />
    </ArtShell>
  );
}

export function StudioTextArt({
  className,
  seed = 0,
}: {
  className?: string;
  seed?: number;
}) {
  const accent = pickAccent(seed);
  return (
    <ArtShell className={className} seed={seed + 21}>
     
      <rect x="18" y="22" width="22" height="3.5" rx="1.75" fill={accent} />
      <rect
        x="18"
        y="29"
        width="28"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/35"
      />
      <rect
        x="18"
        y="35"
        width="24"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/35"
      />
      <rect
        x="18"
        y="41"
        width="18"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/35"
      />
     
    </ArtShell>
  );
}

export function StudioPaletteArt({
  className,
  seed = 0,
  colors,
}: {
  className?: string;
  seed?: number;
  colors?: string[] | null;
}) {
  const fallback = [
    pickAccent(seed),
    pickAccent(seed + 1),
    pickAccent(seed + 2),
    pickAccent(seed + 3),
  ];
  const swatches = (colors?.length ? colors : fallback).slice(0, 4);

  return (
    <ArtShell className={className} seed={seed + 31}>
      <rect
        x="12"
        y="14"
        width="40"
        height="36"
        rx="8"
        className="fill-background stroke-border"
        strokeWidth="1.5"
      />
      {swatches.map((color, index) => {
        const x = 18 + (index % 2) * 15;
        const y = 20 + Math.floor(index / 2) * 14;
        return (
          <circle
            key={`${color}-${index}`}
            cx={x + 6}
            cy={y + 6}
            r="6"
            fill={color}
          />
        );
      })}
    </ArtShell>
  );
}

export function StudioAllArt({
  className,
  seed = 0,
}: {
  className?: string;
  seed?: number;
}) {
  return (
    <ArtShell className={className} seed={seed + 41}>
      <rect
        x="12"
        y="16"
        width="16"
        height="20"
        rx="4"
        fill={pickAccent(seed)}
        opacity="0.9"
      />
      <rect
        x="24"
        y="22"
        width="16"
        height="20"
        rx="4"
        fill={pickAccent(seed + 1)}
        opacity="0.85"
      />
      <rect
        x="36"
        y="18"
        width="16"
        height="20"
        rx="4"
        fill={pickAccent(seed + 2)}
        opacity="0.8"
      />
    </ArtShell>
  );
}

export function StudioTypeArt({
  kind,
  className,
  seed = 0,
  colors,
}: {
  kind: StudioTypeArtKind;
  className?: string;
  seed?: number;
  colors?: string[] | null;
}) {
  if (kind === "carousel") {
    return <StudioCarouselArt className={className} seed={seed} />;
  }
  if (kind === "text") {
    return <StudioTextArt className={className} seed={seed} />;
  }
  if (kind === "palette") {
    return <StudioPaletteArt className={className} seed={seed} colors={colors} />;
  }
  return <StudioAllArt className={className} seed={seed} />;
}
