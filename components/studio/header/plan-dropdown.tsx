"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PlanDropdown({ 
  isUpgrade, 
  openUpgrade 
}: { 
  isUpgrade: boolean; 
  openUpgrade: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {!isUpgrade ? (
          <Button
            variant="outline"
            className="h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors"
          >
            Free plan
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="h-8 rounded-full bg-blue-500/10 px-3.5 text-[13px] font-semibold text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
          >
            Pro
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent 
        align="center" 
        sideOffset={20}
        className="w-[320px] rounded-2xl p-5 shadow-lg"
      >
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {isUpgrade ? "Pro plan" : "Free plan"}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Everyone on your team can access all carousels, and only 3 are editable.
          </p>

          <div className="my-5 h-px w-full bg-border" />

          <p className="mb-3 text-[13px] font-medium text-foreground">
            Upgrade your plan to:
          </p>

          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                <Check className="size-3" strokeWidth={3} />
              </div>
              <p className="text-[13px] leading-snug text-muted-foreground">
                <span className="font-medium text-foreground">Unlimited carousels</span> and advanced workspaces with guest invitations
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                <Check className="size-3" strokeWidth={3} />
              </div>
              <p className="text-[13px] leading-snug text-muted-foreground">
                <span className="font-medium text-foreground">Private carousels</span> with guest invitations
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                <Check className="size-3" strokeWidth={3} />
              </div>
              <p className="text-[13px] leading-snug text-muted-foreground">
                <span className="font-medium text-foreground">Advanced AI</span> for automated transitions
              </p>
            </li>
          </ul>

          <Button 
            onClick={openUpgrade}
            className="mt-6 h-10 w-full rounded-xl font-medium"
          >
            Upgrade to Pro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}