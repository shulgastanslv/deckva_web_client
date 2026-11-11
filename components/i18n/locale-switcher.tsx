"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Translate as Languages,
} from "@phosphor-icons/react";

import { setAppLocale } from "@/lib/i18n/set-locale";
import {
  locales,
  type AppLocale,
} from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  align = "end",
}: {
  className?: string;
  align?: "start" | "end" | "center";
}) {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const pick = (next: AppLocale) => {
    if (next === locale || pending) return;
    startTransition(async () => {
      const res = await setAppLocale(next);
      if (res.ok) router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          className={cn(
            "h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50",
            className,
          )}
          title={t("language")}
          aria-label={t("language")}
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[10rem] rounded-2xl p-1.5">
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => pick(code)}
            className={cn(
              "cursor-pointer rounded-xl px-3 py-2 text-[13px]",
              code === locale && "bg-muted font-medium",
            )}
          >
            {t(`languages.${code}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
