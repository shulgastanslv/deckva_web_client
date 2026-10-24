"use client";

import {
  CleanArt,
  FreeArt,
  SavedArt,
} from "@/components/landing/landing-art";
import {
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
} from "@/components/landing/landing-shell";
import { Reveal, RevealItem, RevealStagger } from "@/components/landing/reveal";

export function FreeBlock() {
  return (
    <LandingSection id="pricing">
      <Reveal>
        <LandingHead
          title="Цена"
          text="Один платёж — студия, генерация и экспорт без водяного знака. Без пробного периода и без логотипа на обложке."
        />
      </Reveal>

      <RevealStagger className="grid gap-3 sm:gap-4 md:grid-cols-12">
        <RevealItem className="md:col-span-7">
          <LandingLayer className="bg-land-card h-full">
            <LandingPad>
              <h3 className="mt-3 max-w-sm text-5xl font-extrabold tracking-tight text-land-ink sm:text-6xl">
                Откройте студию и начните
              </h3>
              <p className="mt-4 max-w-xs text-lg leading-relaxed text-land-ink/55">
                Холст, генерация и загрузка — за $15. Используйте сколько угодно раз.
              </p>
              <div className="mt-5 flex justify-center">
                <FreeArt />
              </div>
            </LandingPad>
          </LandingLayer>
        </RevealItem>

        <RevealItem className="md:col-span-5">
          <LandingLayer className="bg-land-panel h-full text-white">
            <LandingPad className="flex h-full flex-col justify-between">
              <p className="text-base font-bold tracking-wide text-white/60">
                Цена
              </p>
              <p className="mt-6 text-8xl font-extrabold tracking-tight sm:text-9xl">
                $15
              </p>
              <div className="mt-8">
                <h3 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                  Один платёж
                </h3>
                <p className="mt-3 max-w-xs text-lg leading-relaxed text-white/70">
                  Генерируйте, редактируйте и экспортируйте. Без ежемесячной подписки.
                </p>
              </div>
            </LandingPad>
          </LandingLayer>
        </RevealItem>

        <RevealItem className="md:col-span-7">
          <LandingLayer className="bg-land-blue h-full">
            <LandingPad className="flex h-full flex-col justify-between gap-10">
              <div>
                <p className="text-xl font-bold text-white/70">Форматы</p>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-white/70">
                  Один макет переключается под пост, квадрат, историю или широкий фрейм.
                </p>
              </div>
              <p className="text-6xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
                4:3
                <br />
                16:9
                <br />
                3:4
                <br />
                1:1                
              </p>
            </LandingPad>
          </LandingLayer>
        </RevealItem>

        <RevealItem className="md:col-span-5">
          <LandingLayer className="bg-land-card h-full">
            <LandingPad>
              <p className="text-xl font-bold text-land-blue">Проекты</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-land-ink sm:text-4xl">
                Карусель остается вашей
              </h3>
              <p className="mt-3 max-w-xs text-base leading-relaxed text-land-ink/55">
                Войдите и слайды останутся. Закройте вкладку и вернитесь.
              </p>
              <SavedArt />
            </LandingPad>
          </LandingLayer>
        </RevealItem>

        <RevealItem className="md:col-span-12">
          <LandingLayer className="bg-land-card text-land-ink">
            <LandingPad>
              <div className="grid items-center gap-6 sm:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-xl font-bold text-land-blue">Экспорт</p>
                  <h3 className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl">
                    PNG и ZIP, без водяного знака
                  </h3>
                  <p className="mt-4 max-w-sm text-xl leading-relaxed text-land-ink/55">
                    Скачайте слайды как есть. Без логотипа студии на обложке.
                  </p>
                </div>
                <CleanArt />
              </div>
            </LandingPad>
          </LandingLayer>
        </RevealItem>
      </RevealStagger>
    </LandingSection>
  );
}
