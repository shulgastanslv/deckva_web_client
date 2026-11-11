"use client";

export function StudioVideo() {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F2F2F2] dark:bg-[#2a2b33]">
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
