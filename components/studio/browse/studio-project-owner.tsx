import { StudioAvatar } from "@/components/studio/ui/studio-avatar";
import { cn } from "@/lib/utils";

export function StudioProjectOwner({
  name,
  image,
  className,
  showName = true,
}: {
  name: string | null | undefined;
  image?: string | null;
  className?: string;
  showName?: boolean;
}) {
  const label = name?.trim() || "You";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <StudioAvatar
        name={label}
        src={image}
        className="size-5 text-[9px]"
      />
      {showName ? (
        <span className="truncate text-[13px] text-muted-foreground">{label}</span>
      ) : null}
    </span>
  );
}
