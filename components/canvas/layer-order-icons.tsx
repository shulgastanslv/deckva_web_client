import { cn } from "@/lib/utils";

/** Stacked cards + arrow — clearer than generic chevrons for layer order. */

type Direction = "forward" | "back" | "front" | "to-back";

function LayerGlyph({
  className,
  direction,
}: {
  className?: string;
  direction: Direction;
}) {
  const up = direction === "forward" || direction === "front";
  const double = direction === "front" || direction === "to-back";

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={cn("size-5", className)}
    >
      <rect
        x="4.5"
        y="9"
        width="11"
        height="6.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <rect
        x="4.5"
        y="6"
        width="11"
        height="6.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {up ? (
        <>
          <path
            d="M10 4.25V2.25M10 2.25L8.4 3.75M10 2.25L11.6 3.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {double ? (
            <path
              d="M10 5.75L8.4 7.25M10 5.75L11.6 7.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
          ) : null}
        </>
      ) : (
        <>
          <path
            d="M10 15.75v2M10 17.75l-1.6-1.5M10 17.75l1.6-1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {double ? (
            <path
              d="M10 14.25L8.4 12.75M10 14.25L11.6 12.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
          ) : null}
        </>
      )}
    </svg>
  );
}

export function BringForwardIcon({ className }: { className?: string }) {
  return <LayerGlyph direction="forward" className={className} />;
}

export function SendBackwardIcon({ className }: { className?: string }) {
  return <LayerGlyph direction="back" className={className} />;
}

export function BringToFrontIcon({ className }: { className?: string }) {
  return <LayerGlyph direction="front" className={className} />;
}

export function SendToBackIcon({ className }: { className?: string }) {
  return <LayerGlyph direction="to-back" className={className} />;
}
