import type { Metadata } from "next";

import { getPublicCarousel } from "@/actions/projects";
import { CarouselView, ViewHeader } from "@/components/carousel-view";

export const metadata: Metadata = {
  title: "Swibp — carousel",
  description: "A shared Swibp carousel.",
};

export default async function ViewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const result = await getPublicCarousel(projectId);

  if (!result.success) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ViewHeader />
        <main className="grid flex-1 place-items-center px-4 pb-16 text-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">This link is private</h1>
            <p className="mt-3 max-w-sm text-[#5c6170] dark:text-[#a0a0a0]">
              The carousel is not public, or the link is no longer valid.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <CarouselView
      title={result.title}
      aspectRatio={result.aspectRatio}
      slides={result.slides}
    />
  );
}
