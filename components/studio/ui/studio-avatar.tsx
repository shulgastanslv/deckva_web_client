"use client";

import { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

type StudioAvatarProps = {
  letter?: string;
  src?: string | null;
  name?: string | null;
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
      open = false,
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
        aria-label={props["aria-label"] ?? name ?? "Account"}
        data-state={open ? "open" : "closed"}
        className={cn(
          shellClass,
          "cursor-pointer outline-none transition-[transform,box-shadow,opacity] duration-150",
          "hover:scale-105 hover:opacity-95",
          "focus-visible:ring-2 focus-visible:ring-[#4262ff]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-95",
          open &&
            "scale-105 ring-2 ring-[#4262ff]/45 ring-offset-2 ring-offset-background",
        )}
        {...props}
      >
        {face}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full bg-black/0 transition-colors duration-150",
            "hover:bg-black/15",
            open && "bg-black/15",
          )}
        />
      </button>
    );
  },
);
