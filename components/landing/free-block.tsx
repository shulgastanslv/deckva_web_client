"use client";

import { FaInstagram, FaTelegram, FaThreads, FaTiktok } from "react-icons/fa6";

import {
  CleanArt,
  FreeArt,
  SavedArt,
} from "@/components/landing/landing-art";
import { BelarusRubleIcon } from "@/components/landing/belarus-ruble-icon";
import {
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
  landCardTitle,
  landCardSub,
} from "@/components/landing/landing-shell";
import { Reveal, RevealItem, RevealStagger } from "@/components/landing/reveal";

const FORMATS = [
  {
    name: "Instagram",
    ratio: "4:5",
    frame: "aspect-[4/5]",
    Icon: FaInstagram,
    icon: "text-land-ink",
  },
  {
    name: "Threads",
    ratio: "4:5",
    frame: "aspect-[4/5]",
    Icon: FaThreads,
    icon: "text-land-ink",
  },
  {
    name: "TikTok",
    ratio: "9:16",
    frame: "aspect-[9/16]",
    Icon: FaTiktok,
    icon: "text-land-ink",
  },
  {
    name: "Telegram",
    ratio: "1:1",
    frame: "aspect-square",
    Icon: FaTelegram,
    icon: "text-land-ink",
  },
] as const;

export function FreeBlock() {
  return (
    <LandingSection id="pricing">
      <Reveal>
        <LandingHead
          title="Тариф Pro"
          text="15 Br в месяц. Студия, шаблоны и экспорт без водяного знака."
        />
      </Reveal>

      <RevealStagger className="grid gap-3 sm:gap-4 md:grid-cols-12">
        <RevealItem className="md:col-span-7">
          <LandingLayer className="h-full bg-land-card">
            <LandingPad>
              <h3 className={`${landCardTitle} text-land-ink`}>
                Всё для публикации
              </h3>
              <p className={`mt-4 max-w-md text-land-ink/55 ${landCardSub}`}>
                Холст, шаблоны и экспорт слайдов. Без логотипа сервиса на
                обложке.
              </p>
              <div className="mt-5 flex justify-center">
                <FreeArt />
              </div>
            </LandingPad>
          </LandingLayer>
        </RevealItem>

        <RevealItem className="md:col-span-5">
          <LandingLayer className="h-full bg-land-panel text-white">
            <LandingPad className="flex h-full flex-col justify-between">
              <p className={`${landCardTitle} text-white/70`}>Цена</p>
              <div className="mt-6 flex items-start gap-2">
                <p className="text-8xl font-extrabold tracking-tight leading-none sm:text-9xl">
                  15
                </p>
                <BelarusRubleIcon className="mt-3 size-10 shrink-0 text-white sm:mt-4 sm:size-12" />
              </div>
              <div className="mt-8">
                <h3 className={landCardTitle}>в месяц</h3>
                <p className={`mt-4 max-w-xs text-white/70 ${landCardSub}`}>
                  Личная подписка. Отмена в любой момент.
                </p>
              </div>
            </LandingPad>
          </LandingLayer>
        </RevealItem>

        <RevealItem className="md:col-span-7">
          <LandingLayer className="h-full bg-land-blue">
            <LandingPad>
              <h3 className={`${landCardTitle} text-white`}>Форматы</h3>
              <p className={`mt-4 max-w-md text-white/70 ${landCardSub}`}>
                Один проект — несколько пропорций под площадки.
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end">
                {FORMATS.map(({ name, ratio, frame, Icon, icon }) => (
                  <li key={name} className="flex flex-col items-center gap-3">
                    <div
                      className={`relative w-full max-w-[7.5rem] overflow-hidden rounded-3xl ${frame} bg-white`}
                    >
                      <div className="absolute inset-0 grid place-items-center">
                        <Icon className={`size-8 sm:size-9 ${icon}`} aria-hidden />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="mt-0.5 text-xs tabular-nums text-white/55">
                        {ratio}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </LandingPad>
          </LandingLayer>
        </RevealItem>

        <RevealItem className="md:col-span-5">
          <LandingLayer className="h-full bg-land-card">
            <LandingPad>
              <h3 className={`${landCardTitle} text-land-ink`}>
                Сохранение
              </h3>
              <p className={`mt-4 max-w-sm text-land-ink/55 ${landCardSub}`}>
                Проекты остаются в аккаунте — можно вернуться и продолжить.
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
                  <h3 className={`${landCardTitle} text-land-ink`}>
                    Чистый экспорт
                  </h3>
                  <p className={`mt-4 max-w-md text-land-ink/55 ${landCardSub}`}>
                    PNG по одному слайду или ZIP всей карусели. Без водяного
                    знака.
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
