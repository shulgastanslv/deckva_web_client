"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioPrompt } from "@/components/studio/studio-prompt";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  pickStarterPrompts,
  starterText,
  type StarterTopic,
} from "@/lib/studio/onboarding";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { trackEvent } from "@/lib/analytics";

type GreetingPeriod = "morning" | "hello" | "evening";

function greetingPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 17 && hour < 22) return "evening";
  return "hello";
}

function firstNameFrom(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

export function StudioStartSection({
  name,
  topic,
  onBlank,
  onTemplates,
  onBrandKit,
  onImportJson,
  onGenerate,
  onStarter,
  generating,
  generateError,
}: {
  name?: string | null;
  topic?: string;
  onBlank: () => void;
  onTemplates: () => void;
  onBrandKit?: () => void;
  onImportJson?: (file: File) => void | Promise<void>;
  onGenerate: (input: StudioPromptSubmit) => void | Promise<void>;
  onStarter?: (topic: string, starterId: string) => void | Promise<void>;
  generating?: boolean;
  generateError?: string | null;
  focusMode?: boolean;
}) {
  const t = useTranslations("studio");
  const { data: session } = useSession();
  const [period, setPeriod] = useState<GreetingPeriod>("hello");
  const [extraIndex, setExtraIndex] = useState(0);
  const locale = useLocale();
  const [starters, setStarters] = useState<StarterTopic[]>([]);

  const displayName = firstNameFrom(
    name ?? session?.user?.name ?? null,
  );

  useEffect(() => {
    setPeriod(greetingPeriod(new Date().getHours()));
    setExtraIndex(Math.floor(Math.random() * 13));
  }, []);

  useEffect(() => {
    const count = 3 + Math.floor(Math.random() * 3);
    setStarters(pickStarterPrompts(count));
  }, []);

  const timeGreeting = displayName
    ? period === "morning"
      ? t("greetingMorningNamed", { name: displayName })
      : period === "evening"
        ? t("greetingEveningNamed", { name: displayName })
        : t("greetingHelloNamed", { name: displayName })
    : period === "morning"
      ? t("greetingMorning")
      : period === "evening"
        ? t("greetingEvening")
        : t("greetingHello");

  const greeting =
    displayName && extraIndex > 0
      ? t(`greetingExtra.${extraIndex}`, { name: displayName })
      : timeGreeting;

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">
            {t("activationSub")}
          </p>
        </div>
        <span data-tour="create" className="inline-flex shrink-0">
          <StudioCreateMenu
            onBlank={onBlank}
            onTemplates={onTemplates}
            onBrandKit={onBrandKit}
            onImportJson={onImportJson}
            label={t("otherWays")}
            align="end"
            triggerClassName="shrink-0 gap-1.5 bg-muted/40 px-2.5 text-[12px] font-normal text-foreground hover:bg-muted/60 data-[state=open]:bg-muted/60 sm:px-3.5 sm:text-[13px]"
          />
        </span>
      </div>

      <div data-tour="prompt">
        <StudioPrompt
          initialTopic={topic}
          onSubmit={onGenerate}
          busy={generating}
          error={generateError}
        />
      </div>

      {onStarter && starters.length > 0 ? (
        <div
          data-tour="starters"
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-[12px] text-muted-foreground">
                {t("tryStarter")}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6} className="max-w-64">
              {t("tryStarterHint")}
            </TooltipContent>
          </Tooltip>
          {starters.map((starter) => {
            const copy = starterText(starter, locale);
            return (
              <Tooltip key={starter.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => {
                      trackEvent("studio_starter_chip", { id: starter.id });
                      void onStarter(copy.topic, starter.id);
                    }}
                    className="inline-flex h-8 max-w-[220px] items-center rounded-md bg-muted/40 px-3 text-[12px] font-normal text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
                  >
                    <span className="truncate">{copy.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6} className="max-w-72 text-left">
                  {copy.topic}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
