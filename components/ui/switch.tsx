"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

/**
 * Switch — stays `rounded-full` (true circle thumb).
 * Default size sits next to `controlH` rows (`h-10` in `components/ui/control.ts`).
 * Prefer default; use `sm` only in dense chrome.
 */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/20",
        "aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "data-checked:bg-primary data-unchecked:bg-muted",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-[size=default]:h-5 data-[size=default]:w-9",
        "data-[size=sm]:h-4 data-[size=sm]:w-7",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform",
          "dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground",
          "data-unchecked:translate-x-0 data-checked:translate-x-full",
          "group-data-[size=default]/switch:size-4",
          "group-data-[size=sm]/switch:size-3",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
