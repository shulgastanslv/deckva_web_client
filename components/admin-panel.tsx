"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { listNews, publishNews, sendNotification, type NewsItem } from "@/actions/admin";
import { listFeedbacks, type FeedbackItem } from "@/actions/feedback";
import { AdminTemplates } from "@/components/admin-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4"
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
        <h2 className="text-[13px] font-semibold">{title}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>
      </div>
      <Input
        value={heading}
        onChange={(event) => setHeading(event.target.value)}
        placeholder="Title"
        className="h-9"
        required
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Message"
        required
        rows={4}
        className="w-full resize-y rounded-2xl border border-input bg-transparent px-3 py-2 text-[13px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy} className="rounded-full">
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : submitLabel}
        </Button>
        {message ? <span className="text-[13px] text-muted-foreground">{message}</span> : null}
      </div>
    </form>
  );
}

export function AdminPanel({ email }: { email: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const reload = () => {
    void listNews().then((res) => {
      if (res.success) setNews(res.news);
    });
    void listFeedbacks().then((res) => {
      if (res.success) setFeedbacks(res.items);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
          <p className="text-[13px] text-muted-foreground">
            Signed in as {email}. Manage templates, news, and feedback.
          </p>
        </div>
        <Link href="/studio" className="text-[13px] text-muted-foreground hover:text-foreground">
          Back to the studio
        </Link>
      </div>

      <AdminTemplates />

      <Separator />

      <DeskForm
        title="Notification"
        hint="A short note in the bell. It is not stored as news."
        submitLabel="Send"
        onSubmit={async (title, body) => {
          const res = await sendNotification({ title, body });
          return res.success ? null : "Failed to send notification";
        }}
      />

      <DeskForm
        title="News"
        hint="Saved in the news table and delivered as a notification."
        submitLabel="Publish"
        onSubmit={async (title, body) => {
          const res = await publishNews({ title, body });
          if (!res.success) return "Failed to publish news";
          reload();
          return null;
        }}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-semibold">News</h2>
        {news.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Nothing published yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {news.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border/60 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-medium">{item.title}</p>
                  <time className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-muted-foreground">{item.body}</p>
                {item.authorName ? (
                  <p className="mt-2 text-[10px] text-muted-foreground">{item.authorName}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-semibold">Feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No feedback yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {feedbacks.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border/60 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[13px] font-medium">
                    {item.userName ?? item.userEmail}
                  </p>
                  <time className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{item.userEmail}</p>
                <p className="mt-2 whitespace-pre-wrap text-[13px] text-muted-foreground">{item.message}</p>
                {item.images.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.images.map((src, index) => (
                      <a
                        key={`${item.id}-${index}`}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="block size-16 overflow-hidden rounded-xl bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="size-full object-cover" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
