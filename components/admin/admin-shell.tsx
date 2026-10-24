"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  LayoutTemplate,
  MessageSquareText,
  Newspaper,
  Shield,
} from "lucide-react";

import Logo from "@/components/logo";
import { cn } from "@/lib/utils";

export type AdminSection =
  | "templates"
  | "notify"
  | "news"
  | "feedback";

const NAV: Array<{
  id: AdminSection;
  label: string;
  icon: typeof LayoutTemplate;
}> = [
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "notify", label: "Notify", icon: Bell },
  { id: "news", label: "News", icon: Newspaper },
  { id: "feedback", label: "Feedback", icon: MessageSquareText },
];

export function AdminShell({
  email,
  section,
  onSectionChange,
  children,
}: {
  email: string;
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-muted/70 text-foreground dark:bg-background">
      <aside className="flex w-[220px] shrink-0 flex-col bg-muted/70 pt-3 dark:bg-background">
        <div className="flex items-center gap-2 px-4 pb-8">
          <Logo width={32} height={32} href="/studio" className="hover:rotate-0" />
        </div>

        <nav className="flex flex-col gap-0.5 px-2.5">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSectionChange(id)}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-left text-[13px] font-medium transition-colors",
                  active
                    ? "bg-background text-foreground dark:bg-muted"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:hover:bg-muted/50",
                )}
              >
                <Icon className="size-4 shrink-0 stroke-[1.75]" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-2.5 pb-3">
          <Link
            href="/studio"
            className="flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground dark:hover:bg-muted/50"
          >
            <ArrowLeft className="size-4 stroke-[1.75]" />
            Back to studio
          </Link>
        </div>
      </aside>

      <div className="relative m-2 ml-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background">
        {children}
      </div>
    </div>
  );
}
