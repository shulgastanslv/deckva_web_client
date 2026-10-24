"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  listNews,
  publishNews,
  sendNotification,
  type NewsItem,
} from "@/actions/admin";
import { listFeedbacks, type FeedbackItem } from "@/actions/feedback";
import {
  AdminShell,
  type AdminSection,
} from "@/components/admin/admin-shell";
import { AdminTemplates } from "@/components/admin-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function DeskForm({
  title,
  hint,
  submitLabel,
  onSubmit,
}: {
  title: string;
  hint: string;
  submitLabel: string;
  onSubmit: (title: string, body: string) => Promise<string | null>;
}) {
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mx-auto flex w-full max-w-[560px] flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setMessage(null);
        void onSubmit(heading, body)
          .then((error) => {
            setMessage(error ?? "Sent");
            if (!error) {
              setHeading("");
              setBody("");
            }
          })
          .finally(() => setBusy(false));
      }}
    >
      <div>
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>
      </div>
      <Input
        value={heading}
        onChange={(event) => setHeading(event.target.value)}
        placeholder="Title"
        className="h-10 rounded-full bg-muted/50 px-4"
        required
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Message"
        required
        rows={5}
        className="w-full resize-y rounded-2xl bg-muted/50 px-4 py-3 text-[14px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#2f5bff]/30"
      />
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={busy}
          className="h-9 rounded-full bg-[#2f5bff] px-5 text-[13px] font-semibold text-white hover:bg-[#254ae6]"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : submitLabel}
        </Button>
        {message ? (
          <span className="text-[13px] text-muted-foreground">{message}</span>
        ) : null}
      </div>
    </form>
  );
}

function FeedList({
  empty,
  children,
}: {
  empty: boolean;
  children: React.ReactNode;
}) {
  if (empty) {
    return (
      <p className="py-10 text-center text-[13px] text-muted-foreground">
        Nothing here yet.
      </p>
    );
  }
  return <ul className="mx-auto flex w-full max-w-[720px] flex-col gap-2">{children}</ul>;
}

export function AdminPanel({ email }: { email: string }) {
  const [section, setSection] = useState<AdminSection>("templates");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const [newsRes, feedbackRes] = await Promise.all([
        listNews(),
        listFeedbacks(),
      ]);
      if (newsRes.success) setNews(newsRes.news);
      if (feedbackRes.success) setFeedbacks(feedbackRes.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const titles: Record<AdminSection, string> = {
    templates: "Templates",
    notify: "Notify everyone",
    news: "News desk",
    feedback: "Feedback",
  };

  return (
    <AdminShell
      email={email}
      section={section}
      onSectionChange={setSection}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 px-6 pt-4 pb-2 sm:px-8">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
            {titles[section]}
          </h1>
          <p className="text-[12px] text-muted-foreground">
            {section === "templates"
              ? "Library metadata and cleanup"
              : section === "notify"
                ? "Push a short note to every inbox"
                : section === "news"
                  ? "Publish and review studio news"
                  : "Notes from creators"}
          </p>
        </div>
        {(section === "news" || section === "feedback") && (
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-full px-3 text-[12px]"
            onClick={() => void reload()}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-16 sm:px-8">
        {section === "templates" ? <AdminTemplates /> : null}

        {section === "notify" ? (
          <div className="pt-4">
            <DeskForm
              title="Send notification"
              hint="Shows up in the bell. Not saved as news."
              submitLabel="Send"
              onSubmit={async (title, body) => {
                const res = await sendNotification({ title, body });
                return res.success ? null : "Failed to send";
              }}
            />
          </div>
        ) : null}

        {section === "news" ? (
          <div className="space-y-10 pt-4">
            <DeskForm
              title="Publish news"
              hint="Saved as news and delivered as a notification."
              submitLabel="Publish"
              onSubmit={async (title, body) => {
                const res = await publishNews({ title, body });
                if (!res.success) return "Failed to publish";
                await reload();
                return null;
              }}
            />
            <section>
              <h3 className="mb-3 text-[13px] font-semibold text-foreground">
                Recent
              </h3>
              {loading && news.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <FeedList empty={news.length === 0}>
                  {news.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl bg-muted/50 px-4 py-3.5"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[14px] font-semibold text-foreground">
                          {item.title}
                        </p>
                        <time className="shrink-0 text-[11px] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                      {item.authorName ? (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {item.authorName}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </FeedList>
              )}
            </section>
          </div>
        ) : null}

        {section === "feedback" ? (
          <div className="pt-4">
            {loading && feedbacks.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <FeedList empty={feedbacks.length === 0}>
                {feedbacks.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl bg-muted/50 px-4 py-3.5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[14px] font-semibold text-foreground">
                        {item.userName ?? item.userEmail}
                      </p>
                      <time className="shrink-0 text-[11px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.userEmail}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                      {item.message}
                    </p>
                    {item.images.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.images.map((src, index) => (
                          <a
                            key={`${item.id}-${index}`}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              "block size-16 overflow-hidden rounded-xl bg-muted",
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt=""
                              className="size-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </FeedList>
            )}
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
