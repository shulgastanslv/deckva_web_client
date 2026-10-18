"use client";

import { useRouter } from "next/navigation";

import { LOGO_PATH_BACK, LOGO_PATH_FRONT } from "@/components/logo-paths";
import { cn } from "@/lib/utils";

interface LogoProps {
  width: number;
  height: number;
  className?: string;
  href?: string;
}

export function WhiteLogo({
  width,
  height,
  className = "hover:opacity-80 transition-all cursor-pointer duration-300 hover:rotate-6 ease-in-out",
  href = "/",
}: LogoProps) {
  const router = useRouter();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      onClick={() => router.push(href)}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
      aria-hidden
    >
      <path
        className="opacity-45"
        fill="white"
        stroke="white"
        d={LOGO_PATH_BACK}
      />
      <path
        fill="white"
        stroke="white"
        d={LOGO_PATH_FRONT}
      />
    </svg>
  );
}

export default function Logo({
  width,
  height,
  className = "hover:opacity-80 transition-all cursor-pointer duration-300 hover:rotate-6 ease-in-out",
  href = "/",
}: LogoProps) {
  const router = useRouter();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      onClick={() => router.push(href)}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
      aria-hidden
    >
      <path
        className="opacity-45"
        fill="currentColor"
        stroke="currentColor"
        d={LOGO_PATH_BACK}
      />
      <path
        fill="currentColor"
        stroke="currentColor"
        d={LOGO_PATH_FRONT}
      />
    </svg>
  );
}
