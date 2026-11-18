"use client";

import { useEffect, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";

import { StudioCreateMenu } from "@/components/studio/create/studio-create-menu";
import { StudioPrompt } from "@/components/studio/studio-prompt";
import {
  pickStarterPrompts,
  type StarterCarouselId,
} from "@/lib/studio/onboarding";
import type { StudioPromptSubmit } from "@/lib/studio/generation/types";
import { trackEvent } from "@/lib/analytics";
import { useTranslations } from "next-intl";

const STARTER_COUNT = 5;

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
  const [starters, setStarters] = useState<
    Array<{ id: StarterCarouselId }>
  >([]);

  const displayName = firstNameFrom(
    name ?? session?.user?.name ?? null,
  );

  useEffect(() => {
    setPeriod(greetingPeriod(new Date().getHours()));
  }, []);

  useEffect(() => {
    const count = STARTER_COUNT + Math.floor(Math.random() * 2);
    setStarters(pickStarterPrompts(count).map((item) => ({ id: item.id })));
  }, []);

  const greeting =
    period === "morning"
      ? displayName
        ? t("greetingMorningNamed", { name: displayName })
        : t("greetingMorning")
      : period === "evening"
        ? displayName
          ? t("greetingEveningNamed", { name: displayName })
          : t("greetingEvening")
        : displayName
          ? t("greetingHelloNamed", { name: displayName })
          : t("greetingHello");

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-4xl font-medium tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground sm:text-sm">
            {t("activationSub")}
          </p>
        </div>
        <StudioCreateMenu
          onBlank={onBlank}
          onTemplates={onTemplates}
          onBrandKit={onBrandKit}
          onImportJson={onImportJson}
          label={t("otherWays")}
          align="end"
          triggerClassName="shrink-0 gap-1.5 bg-muted/40 px-3.5 text-[13px] font-normal text-foreground hover:bg-muted/60 data-[state=open]:bg-muted/60"
        />
      </div>

      <StudioPrompt
        initialTopic={topic}
        onSubmit={onGenerate}
        busy={generating}
        error={generateError}
      />

      {onStarter && starters.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-muted-foreground">
            {t("tryStarter")}
          </span>
          {starters.map((starter) => (
            <button
              key={starter.id}
              type="button"
              disabled={generating}
              onClick={() => {
                trackEvent("studio_starter_chip", { id: starter.id });
                void onStarter(
                  t(`starters.${starter.id}.topic`),
                  starter.id,
                );
              }}
              className="inline-flex h-8 items-center rounded-md bg-muted/40 px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
            >
              {t(`starters.${starter.id}.label`)}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
