"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { listPublishedNews, type NewsItem } from "@/actions/admin";

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DocsWhatsNew() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void listPublishedNews()
      .then((res) => {
        if (cancelled) return;
        setNews(res.success ? res.news : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <p className="py-6 text-[15px] text-muted-foreground">Nothing new yet.</p>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {news.map((item) => (
        <article key={item.id} className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {item.title}
            </h3>
            <time className="text-[13px] text-muted-foreground">
              {formatWhen(item.createdAt)}
            </time>
          </div>
          <p className="border-l-2 border-primary/40 pl-3 text-[15px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {item.body}
          </p>
          {item.authorName ? (
            <p className="text-[12px] text-muted-foreground/80">
              {item.authorName}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
