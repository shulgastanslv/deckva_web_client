import type { Metadata } from "next";

import { getPublicCarousel } from "@/actions/projects";
import { CarouselView, ViewHeader } from "@/components/carousel-view";

export const metadata: Metadata = {
  title: "Карусель",
  description: "Публичная карусель, созданная в Deckva.",
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
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <ViewHeader />
        <main className="grid flex-1 place-items-center px-4 pb-16 text-center">
          <div className="max-w-sm">
            <h1 className="text-lg font-semibold tracking-tight">This link is private</h1>
            <p className="mt-2 text-[13px] font-normal text-muted-foreground">
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
