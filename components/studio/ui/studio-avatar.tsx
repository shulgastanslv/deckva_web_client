"use client";

import { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

type StudioAvatarProps = {
  letter?: string;
  src?: string | null;
  name?: string | null;
  /** @deprecated Prefer Radix `data-state` on the trigger; kept for call-site compat. */
  open?: boolean;
  interactive?: boolean;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export const StudioAvatar = forwardRef<HTMLButtonElement, StudioAvatarProps>(
  function StudioAvatar(
    {
      letter,
      src,
      name,
      open: _open = false,
      interactive = false,
      className,
      type = "button",
      ...props
    },
    ref,
  ) {
    const [broken, setBroken] = useState(false);
    const initial = letter?.trim() || name?.trim()?.[0] || "U";
    const showImage = Boolean(src) && !broken;

    const face = showImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src!}
        alt=""
        className="absolute inset-0 size-full object-cover"
        onError={() => setBroken(true)}
      />
    ) : (
      <span className="relative z-10">{initial.toUpperCase()}</span>
    );

    const shellClass = cn(
      "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2f5bff] font-semibold text-white border-none",
      className,
    );

    if (!interactive) {
      return (
        <span className={shellClass} aria-hidden>
          {face}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        {...props}
        aria-label={props["aria-label"] ?? name ?? "Account"}
        // Auth/chrome often disagrees with SSR (extensions, Radix Slot merge).
        suppressHydrationWarning
        className={cn(
          shellClass,
          "group cursor-pointer outline-none transition-[transform,box-shadow,opacity] duration-150",
          "hover:scale-105 hover:opacity-95",
          "focus-visible:ring-2 focus-visible:ring-[#4262ff]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-95",
          "data-[state=open]:scale-105 data-[state=open]:ring-2 data-[state=open]:ring-[#4262ff]/45 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background",
        )}
      >
        {face}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-black/0 transition-colors duration-150 hover:bg-black/15 group-data-[state=open]:bg-black/15"
        />
      </button>
    );
  },
);
