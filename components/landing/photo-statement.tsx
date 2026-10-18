"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function PhotoStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary text-white">
        {/* Тонкий градиент для глубины */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary" />
        
        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          
          {/* Текст */}
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-4xl font-bold tracking-tight">
                Не просто Canva.
                <br />
                <span className="text-indigo-400">Редактор для каруселей.</span>
              </h2>
              <p className="mt-4 text-lg text-white">
                Забудьте про статичные слайды. Создавайте карусели, которые реагируют на действия пользователя.
              </p>
              
              <Link
                href="/studio"
                className="mt-8 inline-flex h-10 items-center rounded-full bg-white px-6 text-base font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Редактор
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}