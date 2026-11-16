"use client";

import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function PromptSection() {
  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-col items-center gap-4 pt-2 text-center">
      <Button
        asChild
        className="h-12 rounded-full bg-[#050038] px-7 text-[15px] font-medium text-white hover:bg-[#050038]/90 dark:bg-foreground dark:text-background"
      >
        <a
          href="/studio"
          onClick={() => trackEvent("landing_cta_click", { place: "how" })}
        >
          Open studio
        </a>
      </Button>
      <p className="text-sm text-[#050038]/45 dark:text-muted-foreground">
        First generations are free. Desktop works best.
      </p>
    </div>
  );
}
