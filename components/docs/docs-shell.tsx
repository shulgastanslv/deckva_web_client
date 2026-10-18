"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import Logo from "@/components/logo";
import { DocsWhatsNew } from "@/components/docs/docs-whats-new";
import { Button } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/lib/social";
import {
  DOC_NAV,
  type DocBlock,
  type DocPage,
} from "@/lib/docs/content";
import { cn } from "@/lib/utils";

function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "callout") {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-emerald-500/70 pl-4 text-[15px] leading-relaxed text-muted-foreground italic"
            >
              {block.text}
            </blockquote>
          );
        }
        if (block.type === "p") {
          return (
            <p
              key={index}
              className="text-[15px] leading-relaxed text-muted-foreground"
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "h2") {
          return (
            <h2
              key={index}
              className="pt-2 text-xl font-semibold tracking-tight text-foreground"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul
              key={index}
              className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol
              key={index}
              className="space-y-5 text-[15px] leading-relaxed text-muted-foreground"
            >
              {block.items.map((item, i) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.points?.length ? (
                      <ul className="mt-1.5 list-disc space-y-1 pl-4">
                        {item.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <div
            key={index}
            className="overflow-hidden rounded-xl ring-1 ring-foreground/10"
          >
            <table className="w-full text-left text-[13px]">
              <tbody>
                {block.rows.map((row) => (
                  <tr
                    key={row.keys}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="bg-muted/40 px-3 py-2.5 font-mono text-foreground whitespace-nowrap">
                      {row.keys}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {row.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function SidebarNav({
  activeSlug,
  onNavigate,
}: {
  activeSlug: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-6 px-3 py-4">
      {DOC_NAV.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.slug === activeSlug;
              return (
                <li key={item.slug}>
                  <Link
                    href={`/docs/${item.slug}`}
                    onClick={onNavigate}
                    className={cn(
                      "relative block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                      active
                        ? "bg-muted/80 font-medium text-foreground before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                  {item.children?.length ? (
                    <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-border/50 pl-2">
                      {item.children.map((child) => {
                        const childActive = child.slug === activeSlug;
                        return (
                          <li key={child.slug}>
                            <Link
                              href={`/docs/${child.slug}`}
                              onClick={onNavigate}
                              className={cn(
                                "block rounded-md px-2 py-1 text-[12px] transition-colors",
                                childActive
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {child.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ContactExtras() {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      <Button asChild className="h-9 rounded-full">
        <a href="mailto:hello@swibp.io">Email hello@swibp.io</a>
      </Button>
      <Button asChild variant="outline" className="h-9 rounded-full">
        <Link href="/studio">Open studio feedback</Link>
      </Button>
    </div>
  );
}

function SocialExtras() {
  return (
    <div className="mt-8 flex flex-col gap-2 sm:max-w-sm">
      <Button
        asChild
        variant="outline"
        className="h-10 justify-start rounded-full"
      >
        <a
          href={SOCIAL_LINKS.telegram}
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        className="h-10 justify-start rounded-full"
      >
        <a
          href={SOCIAL_LINKS.threads}
          target="_blank"
          rel="noopener noreferrer"
        >
          Threads
        </a>
      </Button>
    </div>
  );
}

function ResourcesExtras() {
  return (
    <div className="mt-8 grid gap-2 sm:max-w-md">
      {[
        { href: "/", label: "Home page" },
        { href: "/studio", label: "Studio" },
        { href: "/studio/templates", label: "Templates library" },
        { href: "/docs/social", label: "Social links" },
        { href: "/docs/faq", label: "FAQ" },
      ].map((item) => (
        <Button
          key={item.href}
          asChild
          variant="outline"
          className="h-10 justify-start rounded-full"
        >
          <Link href={item.href}>{item.label}</Link>
        </Button>
      ))}
    </div>
  );
}

export function DocsShell({ page }: { page: DocPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSlug = page.slug;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open docs menu"
            >
              <Menu className="size-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <Logo width={28} height={28} href="/docs" />
              <Link
                href="/docs"
                className="text-[16px] font-semibold tracking-tight"
              >
                Docs
              </Link>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-full px-4 text-[13px]"
          >
            <Link href="/studio">Open studio</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[240px] shrink-0 overflow-y-auto border-r border-border/60 lg:block">
          <SidebarNav activeSlug={activeSlug} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-background shadow-xl ring-1 ring-foreground/10">
              <div className="flex h-14 items-center justify-between border-b border-border/60 px-3">
                <span className="px-2 text-[13px] font-semibold">Docs</span>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav
                  activeSlug={activeSlug}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
          <p className="text-[12px] font-medium tracking-wide text-muted-foreground">
            {page.category}
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {page.title}
          </h1>

          <div className="mt-8 max-w-2xl">
            <DocBlocks blocks={page.blocks} />
            {page.slug === "whats-new" ? <DocsWhatsNew /> : null}
            {page.slug === "contact" ? <ContactExtras /> : null}
            {page.slug === "social" ? <SocialExtras /> : null}
            {page.slug === "resources" ? <ResourcesExtras /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
