"use client";

import { PhoneFrame } from "@/components/canvas/phone-frame";
import { cn } from "@/lib/utils";

/** Phone frame with a real mobile-editor screenshot. */
export function MobileStudioVisual({
  className,
  alt,
}: {
  className?: string;
  alt: string;
}) {
  return (
    <div
      className={cn("relative mx-auto w-full", className)}
      role="img"
      aria-label={alt}
    >
      <PhoneFrame
        size="fluid"
        className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/mobile-editor.png"
          alt=""
          width={780}
          height={1688}
          className="h-full w-full object-cover object-top"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </PhoneFrame>
    </div>
  );
}
