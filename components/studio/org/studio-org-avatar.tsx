import { cn } from "@/lib/utils";

export function StudioOrgAvatar({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || name.slice(0, 2).toUpperCase() || "OR";

  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white",
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
