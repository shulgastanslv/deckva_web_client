"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { useSession } from "next-auth/react";

import { submitFeedback } from "@/actions/feedback";
import { AuthModal } from "@/components/auth";
import {
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
} from "@/components/landing/landing-shell";
import { cn } from "@/lib/utils";

const STARS = [1, 2, 3, 4, 5] as const;

export function LeaveReviewBlock() {
  const { status } = useSession();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const active = hover || rating;
  const canSend = message.trim().length >= 4 && !busy;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    if (status !== "authenticated") {
      setAuthOpen(true);
      return;
    }

    setBusy(true);
    setError(null);
    const body = `[${rating}/5]\n${message.trim()}`;
    const res = await submitFeedback({ message: body });
    setBusy(false);

    if (!res.success) {
      setError((res as { error: string }).error);
      return;
    }

    setSent(true);
    setMessage("");
  };

  return (
    <LandingSection id="review">
      <LandingLayer className="bg-land-card">
        <LandingPad>
          <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <LandingHead
              title="Оставьте отзыв"
              text="Расскажите нам, что понравилось, что не понравилось, или что вы хотите дальше. Мы читаем каждый отзыв."
            />

            {sent ? (
              <div className="flex min-h-[220px] flex-col justify-center rounded-[1.5rem] bg-land-mist px-6 py-8 sm:px-8">
                <p className="text-4xl font-extrabold tracking-tight text-land-ink">
                  Спасибо!
                </p>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-land-ink/55">
                  Ваш отзыв добавлен в список. Вернитесь в любое время после следующей
                  карусели.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 inline-flex h-11 w-fit items-center rounded-full bg-land-panel px-5 text-sm font-semibold text-white"
                >
                  Написать другой
                </button>
              </div>
            ) : (
              <form
                onSubmit={(event) => void onSubmit(event)}
                className="flex flex-col gap-5"
              >
                <div>
                  <p className="text-lg font-semibold text-land-ink">Оценка</p>
                  <div
                    className="mt-2 flex items-center gap-1"
                    onMouseLeave={() => setHover(0)}
                  >
                    {STARS.map((value) => {
                      const on = value <= active;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`${value} звезд`}
                          aria-pressed={rating === value}
                          onMouseEnter={() => setHover(value)}
                          onClick={() => setRating(value)}
                          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-land-mist"
                        >
                          <Star
                            className={cn(
                              "size-6 transition-colors",
                              on
                                ? "fill-land-blue text-land-blue"
                                : "text-land-ink/20",
                            )}
                            strokeWidth={1.75}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-sm font-medium text-land-ink/45">
                      {rating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="landing-review"
                    className="text-sm font-semibold text-land-ink"
                  >
                    Ваш отзыв
                  </label>
                  <textarea
                    id="landing-review"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    required
                    minLength={4}
                    placeholder="Что мы должны знать о Swibp?"
                    className="mt-2 min-h-[140px] w-full resize-y rounded-2xl border border-land-ink/10 bg-land-mist/50 px-4 py-3 text-base leading-relaxed text-land-ink outline-none placeholder:text-land-ink/35 focus:border-land-blue/40 focus:ring-3 focus:ring-land-blue/15"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={!canSend}
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors",
                      canSend
                        ? "bg-land-blue text-white hover:bg-land-blue/90"
                        : "bg-land-mist text-land-ink/35",
                    )}
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : status === "authenticated" ? (
                      "Отправить отзыв"
                    ) : (
                      "Войти, чтобы отправить"
                    )}
                  </button>
                  {status !== "authenticated" ? (
                    <p className="text-sm text-land-ink/45">
                      Отзывы сохраняются в вашем аккаунте.
                    </p>
                  ) : null}
                </div>

                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : null}
              </form>
            )}
          </div>
        </LandingPad>
      </LandingLayer>

      <AuthModal isOpen={authOpen} onOpenChange={setAuthOpen} />
    </LandingSection>
  );
}
