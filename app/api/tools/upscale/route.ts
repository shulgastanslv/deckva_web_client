import { NextResponse } from "next/server";

import { proxyToolsRequest, requireFile } from "@/lib/image/tools-proxy";

export const maxDuration = 180;

const SCALES = new Set(["2", "3", "4"]);

export async function POST(request: Request) {
  const incoming = await request.formData();
  const file = requireFile(incoming);
  if (file instanceof Response) return file;

  const scaleRaw = String(incoming.get("scale") ?? "2");
  if (!SCALES.has(scaleRaw)) {
    return NextResponse.json({ error: "scale must be one of 2, 3, 4" }, { status: 400 });
  }

  const form = new FormData();
  form.append("file", file, file instanceof File ? file.name : "image.png");
  form.append("scale", scaleRaw);
  return proxyToolsRequest("/api/upscale", form, { expect: "image" });
}
