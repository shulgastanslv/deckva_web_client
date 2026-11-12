import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/session";
import { resolveGoogleDriveAccess } from "@/lib/connectors/google-drive-account";
import {
  downloadGoogleDriveFile,
  fetchGoogleDriveThumbnail,
} from "@/lib/connectors/google-drive";

export async function GET(
  request: Request,
  context: { params: Promise<{ fileId: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId: rawId } = await context.params;
  const fileId = rawId?.trim();
  if (!fileId) {
    return NextResponse.json({ error: "Missing file id" }, { status: 400 });
  }

  const auth = await resolveGoogleDriveAccess(userId);
  if (!auth) {
    return NextResponse.json(
      { error: "Google Drive is not connected" },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const thumb = url.searchParams.get("thumb") === "1";

  try {
    if (thumb) {
      const preview = await fetchGoogleDriveThumbnail(
        auth.accessToken,
        fileId,
        400,
      );
      if (preview) {
        return new NextResponse(new Uint8Array(preview.bytes), {
          headers: {
            "Content-Type": preview.mimeType,
            "Cache-Control": "private, max-age=300",
          },
        });
      }
      // Fall through to full download when Drive has no thumbnail.
    }

    const file = await downloadGoogleDriveFile(auth.accessToken, fileId);
    return new NextResponse(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
        "Cache-Control": "private, max-age=120",
      },
    });
  } catch (err) {
    console.error("google-drive file route:", err);
    return NextResponse.json(
      { error: "Couldn't load Drive file" },
      { status: 502 },
    );
  }
}
