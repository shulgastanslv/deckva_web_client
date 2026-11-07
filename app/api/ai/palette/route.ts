import { NextResponse } from "next/server";

import { generatePaletteUpstream } from "@/lib/ai/generate-palette";

export const maxDuration = 120;

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
  const language = typeof row.language === "string" ? row.language : undefined;

  if (topic.trim().length < 2) {
    return NextResponse.json(
      { error: "topic is required (min 2 characters)" },
      { status: 400 },
    );
  }

  try {
    const result = await generatePaletteUpstream({ topic, language });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Palette generation failed";
    const status =
      message.includes("Couldn't reach") || message.includes("timed out")
        ? 502
        : 500;
    console.error("ai/palette:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
