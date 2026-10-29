"use client";

export function StudioVideo() {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-land-ink/5">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        controls
        playsInline
        preload="metadata"
      >
        <source src="/export-1793298925294.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
