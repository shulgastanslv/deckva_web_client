"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  Moon,
  Sun,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    setMounted(true);
  }, []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50",
        className,
      )}
      title={
        mounted
          ? dark
            ? t("switchToLight")
            : t("switchToDark")
          : t("toggleTheme")
      }
      aria-label={
        mounted
          ? dark
            ? t("switchToLightTheme")
            : t("switchToDarkTheme")
          : t("toggleTheme")
      }
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {!mounted ? (
        <Moon className="size-4 opacity-0" />
      ) : dark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
