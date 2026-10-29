"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useSession } from "next-auth/react";

import { submitFeedback } from "@/actions/feedback";
import {
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
  landCardSub,
  landTitle,
} from "@/components/landing/landing-shell";
import { cn } from "@/lib/utils";

const STARS = [1, 2, 3, 4, 5] as const;
const IMAGE_MAX = 4;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Не удалось прочитать файл"));
    };
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

export function LeaveReviewBlock() {
  const { status } = useSession();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (status !== "authenticated") return null;

  const active = hover || rating;
  const canSend = images.length > 0 && !busy;

  const addFiles = async (files: FileList | File[] | null) => {
    if (!files || (Array.isArray(files) ? files.length === 0 : !files.length)) {
      return;
    }
    setError(null);
    const list = Array.isArray(files) ? files : Array.from(files);
    const next = [...images];
    for (const file of list) {
      if (next.length >= IMAGE_MAX) break;
      if (!file.type.startsWith("image/")) {
        setError("Нужны изображения слайдов");
        continue;
      }
      try {
        next.push(await readFileAsDataUrl(file));
      } catch {
        setError("Не удалось прочитать изображение");
      }
    }
    setImages(next.slice(0, IMAGE_MAX));
    if (inputRef.current) inputRef.current.value = "";
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    setBusy(true);
    setError(null);
    const res = await submitFeedback({
      message: `[${rating}/5] Карусель`,
      images,
    });
    setBusy(false);

    if (!res.success) {
      setError((res as { error: string }).error);
      return;
    }

    setSent(true);
    setImages([]);
  };

  return (
    <LandingSection id="review">
      <LandingLayer className="bg-land-card">
        <LandingPad>
          <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <LandingHead
              title="Оставить отзыв"
              text="Загрузите карусель — слайды, которые собрали в студии."
            />

            {sent ? (
              <div className="flex min-h-[220px] flex-col justify-center rounded-[1.5rem] bg-land-mist px-6 py-8 sm:px-8">
                <p className={`${landTitle} text-land-ink`}>Спасибо</p>
                <p className={`mt-4 max-w-sm text-land-ink/55 ${landCardSub}`}>
                  Карусель получена. Можно отправить ещё одну позже.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 inline-flex h-11 w-fit items-center rounded-full bg-land-panel px-5 text-sm font-semibold text-white"
                >
                  Отправить ещё
                </button>
              </div>
            ) : (
              <form
                onSubmit={(event) => void onSubmit(event)}
                className="flex flex-col gap-5"
              >
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-land-ink sm:text-3xl">
                    Оценка
                  </p>
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
                          aria-label={`${value} звёзд`}
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
                  <p className="text-sm font-semibold text-land-ink">
                    Карусель
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    className="sr-only"
                    onChange={(event) => void addFiles(event.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      void addFiles(event.dataTransfer.files);
                    }}
                    className={cn(
                      "mt-2 flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed px-4 py-8 text-center transition-colors",
                      dragging
                        ? "border-land-blue bg-land-blue/10"
                        : "border-land-ink/15 bg-land-mist/50 hover:border-land-blue/40 hover:bg-land-mist",
                    )}
                  >
                    <span className="grid size-12 place-items-center rounded-full bg-land-card text-land-blue">
                      <ImagePlus className="size-5" />
                    </span>
                    <span className="text-base font-semibold text-land-ink">
                      Перетащите слайды сюда
                    </span>
                    <span className="max-w-xs text-sm text-land-ink/55">
                      PNG или JPEG, до {IMAGE_MAX} кадров карусели
                    </span>
                  </button>

                  {images.length > 0 ? (
                    <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {images.map((src, index) => (
                        <li
                          key={`${index}-${src.slice(0, 24)}`}
                          className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-land-mist"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Убрать слайд"
                            onClick={() =>
                              setImages((current) =>
                                current.filter((_, i) => i !== index),
                              )
                            }
                            className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-land-ink/80 text-white"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
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
                    ) : (
                      "Отправить карусель"
                    )}
                  </button>
                  <p className="text-sm text-land-ink/45">
                    {images.length}/{IMAGE_MAX} слайдов
                  </p>
                </div>

                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : null}
              </form>
            )}
          </div>
        </LandingPad>
      </LandingLayer>
    </LandingSection>
  );
}
