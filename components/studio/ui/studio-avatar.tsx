"use client";

import { forwardRef, useEffect, useState } from "react";

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

    useEffect(() => {
      setBroken(false);
    }, [src]);

    const initial = (letter?.trim() || name?.trim()?.[0] || "U").toUpperCase();
    const showImage = Boolean(src) && !broken;

    const face = showImage ? (
      // eslint-disable-next-line @next/next/no-img-element -- remote Google + data URLs
      <img
        src={src!}
        alt=""
        referrerPolicy="no-referrer"
        className="absolute inset-0 size-full rounded-full object-cover"
        onError={() => setBroken(true)}
      />
    ) : (
      <span className="relative z-10 select-none">{initial}</span>
    );

    const shellClass = cn(
      "relative inline-flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full",
      "border-none bg-primary font-semibold text-primary-foreground",
      "isolate [transform:translateZ(0)]",
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
        suppressHydrationWarning
        className={cn(
          shellClass,
          "group cursor-pointer outline-none transition-[opacity] duration-150",
          "hover:opacity-90",
          "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-[state=open]:ring-2 data-[state=open]:ring-ring/40 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background",
        )}
      >
        {face}
      </button>
    );
  },
);
