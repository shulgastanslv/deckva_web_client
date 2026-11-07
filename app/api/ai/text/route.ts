import { NextResponse } from "next/server";

import { generateTextUpstream } from "@/lib/ai/generate-text";

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
  const post_text =
    typeof row.post_text === "string"
      ? row.post_text
      : "";

  if (post_text.trim().length < 2) {
    return NextResponse.json(
      { error: "post_text is required (min 2 characters)" },
      { status: 400 },
    );
  }

  try {
    const result = await generateTextUpstream({ post_text: post_text.trim() });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Text generation failed";
    const status =
      message.includes("Couldn't reach") || message.includes("timed out")
        ? 502
        : 500;
    console.error("ai/text:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
