"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderIcon,
  HomeIcon,
  LayoutGridIcon,
  PlusIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";

import { AuthModal } from "@/components/auth";
import { LogoAnimated } from "@/components/logo-animated";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { stashStudioIntent } from "@/lib/studio/pending-intent";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/studio",
    label: "Home",
    icon: HomeIcon,
    match: (path: string) => path === "/studio",
  },
  {
    href: "/studio/projects",
    label: "Projects",
    icon: FolderIcon,
    match: (path: string) => path.startsWith("/studio/projects"),
  },
  {
    href: "/studio/templates",
    label: "Templates",
    icon: LayoutGridIcon,
    match: (path: string) => path.startsWith("/studio/templates"),
  },
] as const;

function RailTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [authVerifyToken, setAuthVerifyToken] = useState<string | null>(null);
  const [authResetToken, setAuthResetToken] = useState<string | null>(null);

  useEffect(() => {
    const onAuthLink = (event: Event) => {
      const detail = (
        event as CustomEvent<{ verify?: string | null; reset?: string | null }>
      ).detail;
      if (detail?.verify) setAuthVerifyToken(detail.verify);
      if (detail?.reset) setAuthResetToken(detail.reset);
      if (detail?.verify || detail?.reset) setAuthOpen(true);
    };
    window.addEventListener("core:auth-link", onAuthLink);
    return () => window.removeEventListener("core:auth-link", onAuthLink);
  }, []);

  const startBlank = () => {
    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }
    stashStudioIntent({ type: "new" });
    router.push("/studio/editor");
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <aside className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-border/60 bg-background py-5">
        <TooltipProvider delayDuration={250}>
          <div className="flex flex-col items-center">
            <LogoAnimated
              width={26}
              height={26}
              href="/studio"
              className="opacity-90 hover:opacity-100"
            />
            <div className="mt-7 flex flex-col items-center gap-1.5">
              {NAV.map(({ href, label, icon: Icon, match }) => {
                const active = match(pathname);
                return (
                  <RailTip key={href} label={label}>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-9 rounded-full transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <Link href={href} aria-label={label}>
                        <Icon className="size-[18px] stroke-[1.5]" />
                      </Link>
                    </Button>
                  </RailTip>
                );
              })}
              <RailTip label="New project">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  aria-label="New project"
                  onClick={startBlank}
                >
                  <PlusIcon className="size-[18px] stroke-[1.5]" />
                </Button>
              </RailTip>
            </div>
          </div>

          <ThemeSwitcher className="size-9 rounded-full hover:bg-muted/70" />
        </TooltipProvider>
      </aside>

      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
        {children}
      </div>

      <AuthModal
        isOpen={authOpen}
        verifyToken={authVerifyToken}
        resetToken={authResetToken}
        onOpenChange={(open) => {
          setAuthOpen(open);
          if (!open) {
            setAuthVerifyToken(null);
            setAuthResetToken(null);
          }
        }}
      />
    </div>
  );
}
