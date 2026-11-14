import * as React from "react"
import { cn } from "cn"
import { controlH } from "@/components/ui/control"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlH,
        "w-full min-w-0 rounded-md border-none bg-muted/40 px-3.5 text-[13px] font-normal shadow-none transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-foreground placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
