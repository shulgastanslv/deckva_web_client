import type { ProjectListItem } from "@/actions/projects";
import { cn } from "@/lib/utils";

const THUMB_COLORS = [
  "bg-emerald-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-amber-400",
  "bg-sky-500",
  "bg-orange-500",
] as const;

function projectAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * 17) % 97;
  return THUMB_COLORS[hash % THUMB_COLORS.length];
}

export function StudioProjectThumb({
  project,
  className,
}: {
  project: ProjectListItem;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-md",
        !project.previewUrl && projectAccent(project.id),
        className,
      )}
    >
      {project.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.previewUrl}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-[10px] font-semibold text-white/90">
          {(project.title || "U").slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  );
}
