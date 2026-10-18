import React, { useState } from 'react';
import { CarouselEditorArt } from './landing-art';

export function PhotoStatement() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 font-sans">
      <div className="relative overflow-hidden rounded-[2rem] bg-white text-land-ink">

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="px-6 pt-10 pb-6 sm:px-10 sm:py-14 lg:col-span-6 lg:py-16">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-[1.15]">
                Не просто Canva.
                <br />
              </h2>

              <p className="mt-4 text-base font-normal text-land-ink/80 sm:text-lg max-w-md leading-relaxed">
                Забудьте про статичные слайды. Создавайте карусели, которые
                реагируют на действия пользователя.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href="/studio"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-land-blue px-7 text-sm font-bold text-white hover:opacity-80"
                >
                  Открыть редактор
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center px-6 pb-10 sm:px-10 lg:col-span-6 lg:p-12 lg:pl-0">
            <div className="w-full flex justify-center transition-transform hover:scale-[1.02] duration-300">
              <CarouselEditorArt />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


