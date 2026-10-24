import { cn } from "@/lib/utils";

export function StudioAvatar({
  letter,
  className,
}: {
  letter: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#2f5bff] font-semibold text-white",
        className,
      )}
      aria-hidden
    >
      {letter}
    </span>
  );
}
