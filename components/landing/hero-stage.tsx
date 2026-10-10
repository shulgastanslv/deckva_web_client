"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"; // или motion/react
import { cn } from "@/lib/utils"; // Утилита из shadcn/ui (clsx + tailwind-merge)

export const THREAD_SHOTS = [
  "/threads/function.png",
  "/threads/gotoit.png",
  "/threads/lua.png",
  "/threads/memcashed.png",
  "/threads/rainbow.png",
  "/threads/redis.png",
  "/threads/redis2.png",
  "/threads/vlan.png",
  "/threads/yandexmap.png",
] as const;

export function ThreadShot({ start }: { start: number }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(start % THREAD_SHOTS.length);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % THREAD_SHOTS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <img
      src={THREAD_SHOTS[index]}
      alt=""
      className="h-full w-full object-cover object-top"
    />
  );
}

// --- Компонент Рамки Телефона (Сделан чисто на Tailwind, без лишней вложенности) ---
export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // База: темный корпус, скругления, тень
        "relative mx-auto h-[600px] w-[300px] overflow-hidden rounded-[3rem] border-[8px] border-neutral-900 bg-neutral-950 shadow-2xl",
        // Блик на экране
        "before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-gradient-to-tr before:from-white/5 before:to-transparent before:pointer-events-none before:z-20",
        // Кнопки громкости (декор)
        "after:absolute after:-left-[10px] after:top-24 after:h-12 after:w-1 after:rounded-l-md after:bg-neutral-800",
        className
      )}
    >
      {/* Динамический остров / Челка */}
      <div className="absolute top-0 left-1/2 z-30 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />

      {/* Экран */}
      <div className="h-full w-full overflow-hidden rounded-[2.2rem] bg-black">
        {children}
      </div>
    </div>
  );
}

// --- Основная сцена ---
export function HeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Анимации при скролле
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotBack = useTransform(scrollYProgress, [0, 1], [-8, -12]);
  const rotFront = useTransform(scrollYProgress, [0, 1], [6, 2]);

  return (
    <section ref={ref} className="relative flex items-center justify-center overflow-hidden py-2 sm:py-6 lg:py-10">
      <div className="relative mx-auto h-[420px] w-full max-w-4xl sm:h-[540px] lg:h-[620px]">

        {/* Задний телефон */}
        <motion.div
          className="absolute top-8 left-[6%] z-10 hidden scale-[0.72] opacity-80 sm:block lg:scale-90"
          style={reduce ? undefined : { y: yBack, rotate: rotBack }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <PhoneFrame>
              <ThreadShot start={0} />
            </PhoneFrame>
          </motion.div>
        </motion.div>

        {/* Передний телефон (Instagram) */}
        <motion.div
          className="absolute top-0 left-1/2 z-20 origin-top -translate-x-1/2 scale-[0.62] sm:left-auto sm:right-[6%] sm:translate-x-0 sm:scale-[0.78] lg:scale-100"
          style={reduce ? { rotate: 6 } : { y: yFront, rotate: rotFront }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <PhoneFrame>
              <ThreadShot start={2} />
            </PhoneFrame>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
