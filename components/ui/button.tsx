import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"
import { controlH, controlHSm, controlSize } from "@/components/ui/control"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-[13px] font-medium whitespace-nowrap shadow-none transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-none bg-muted/40 text-foreground hover:bg-muted/60 aria-expanded:bg-muted/60",
        secondary:
          "border-none bg-muted/40 text-foreground hover:bg-muted/60 aria-expanded:bg-muted/60",
        ghost:
          "border-none hover:bg-muted/60 hover:text-foreground aria-expanded:bg-muted/60",
        destructive:
          "border-none bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: `${controlH} gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3`,
        xs: `$h-8 gap-1 rounded-md px-2.5 text-[13px] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5`,
        sm: `${controlHSm} gap-1.5 rounded-md px-3.5 text-[13px] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4`,
        lg: `$h-12 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3`,
        icon: controlSize,
        "icon-xs": `${controlSize} rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3.5`,
        "icon-sm": `${controlSize} rounded-md in-data-[slot=button-group]:rounded-md`,
        "icon-lg": controlSize,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
