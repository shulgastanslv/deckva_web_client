import { proxyToolsRequest, requireFile } from "@/lib/image/tools-proxy";

export const maxDuration = 180;

export async function POST(request: Request) {
  const incoming = await request.formData();
  const file = requireFile(incoming);
  if (file instanceof Response) return file;

  const form = new FormData();
  form.append("file", file, file instanceof File ? file.name : "image.png");
  form.append("format", "json");
  form.append("include_data_url", "true");
  return proxyToolsRequest("/api/magic-layer", form, { expect: "json" });
}
