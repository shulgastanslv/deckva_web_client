import {
  landCardSub,
  landTitle,
} from "@/components/landing/landing-shell";
import { CarouselEditorArt } from "./landing-art";

export function PhotoStatement() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 font-sans sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-land-card text-land-ink">
        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="px-6 pb-6 pt-10 sm:px-10 sm:py-14 lg:col-span-6 lg:py-16">
            <div>
              <h2 className={`max-w-lg ${landTitle}`}>
                Это не клон Canva
              </h2>

              <p className={`mt-5 max-w-md text-land-ink/70 ${landCardSub}`}>
                Deckva заточен под карусель: слайды в формате поста, слои,
                порядок и экспорт в одном месте.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href="/studio"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-land-blue px-7 text-sm font-bold text-white hover:opacity-80"
                >
                  Открыть
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center px-6 pb-10 sm:px-10 lg:col-span-6 lg:p-12 lg:pl-0">
            <div className="flex w-full justify-center transition-transform duration-300 hover:scale-[1.02]">
              <CarouselEditorArt />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
