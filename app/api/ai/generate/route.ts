import { NextResponse } from "next/server";

import {
  generateCarouselUpstream,
  type GenerateCarouselInput,
} from "@/lib/ai/generate";
import { isRatioKey } from "@/lib/templates/parse";

export const maxDuration = 180;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected an object body" }, { status: 400 });
  }

  const row = body as Record<string, unknown>;
  const topic = typeof row.topic === "string" ? row.topic : "";
  if (topic.trim().length < 2) {
    return NextResponse.json(
      { error: "topic is required (min 2 characters)" },
      { status: 400 },
    );
  }

  const input: GenerateCarouselInput = {
    topic,
    aspectRatio:
      typeof row.aspectRatio === "string" && isRatioKey(row.aspectRatio)
        ? row.aspectRatio
        : undefined,
    slidesCount:
      typeof row.slidesCount === "number" ? row.slidesCount : undefined,
    language: typeof row.language === "string" ? row.language : undefined,
    handle: typeof row.handle === "string" ? row.handle : undefined,
    cover: typeof row.cover === "string" ? row.cover : undefined,
  };

  try {
    const result = await generateCarouselUpstream(input);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Carousel generation failed";
    const status =
      message.includes("Couldn't reach") || message.includes("timed out")
        ? 502
        : 500;
    console.error("ai/generate:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
