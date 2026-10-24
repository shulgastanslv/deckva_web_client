import { studioGreeting } from "@/components/studio/lib/format";

export function StudioGreeting({ name }: { name?: string | null }) {
  return (
    <h1
      className="text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] tracking-[-0.02em] text-neutral-950 dark:text-foreground"
      style={{
        fontFamily: "var(--font-studio-serif), ui-serif, Georgia, serif",
      }}
    >
      {studioGreeting(name)}
    </h1>
  );
}
