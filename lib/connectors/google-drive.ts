import { connectorCallbackUrl } from "@/lib/connectors/oauth-state";

const DRIVE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.readonly",
] as const;

export function googleDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function googleDriveAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: connectorCallbackUrl("google-drive"),
    response_type: "code",
    scope: DRIVE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

export async function exchangeGoogleDriveCode(
  code: string,
): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: connectorCallbackUrl("google-drive"),
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export async function fetchGoogleDriveProfile(accessToken: string): Promise<{
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error("Failed to load Google profile");
  }
  const data = (await res.json()) as {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  if (!data.id) throw new Error("Google profile missing id");
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

export function googleDriveScopes(): string[] {
  return [...DRIVE_SCOPES];
}

export async function refreshGoogleDriveToken(
  refreshToken: string,
): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export type GoogleDriveImageFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number | null;
  modifiedTime: string | null;
  width: number | null;
  height: number | null;
};

export async function listGoogleDriveImages(
  accessToken: string,
  options?: { query?: string; pageToken?: string; pageSize?: number },
): Promise<{ files: GoogleDriveImageFile[]; nextPageToken: string | null }> {
  const pageSize = Math.min(40, Math.max(1, options?.pageSize ?? 24));
  const nameQuery = options?.query?.trim();
  const qParts = [
    "trashed = false",
    "(mimeType contains 'image/' or mimeType = 'image/svg+xml')",
  ];
  if (nameQuery) {
    const escaped = nameQuery.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    qParts.push(`name contains '${escaped}'`);
  }

  const params = new URLSearchParams({
    q: qParts.join(" and "),
    spaces: "drive",
    corpora: "user",
    pageSize: String(pageSize),
    orderBy: "modifiedTime desc",
    fields:
      "nextPageToken,files(id,name,mimeType,size,modifiedTime,imageMediaMetadata(width,height))",
  });
  if (options?.pageToken) params.set("pageToken", options.pageToken);

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive list failed: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    nextPageToken?: string;
    files?: Array<{
      id?: string;
      name?: string;
      mimeType?: string;
      size?: string;
      modifiedTime?: string;
      imageMediaMetadata?: { width?: number; height?: number };
    }>;
  };

  const files: GoogleDriveImageFile[] = (data.files ?? [])
    .filter((file): file is { id: string; name?: string; mimeType?: string; size?: string; modifiedTime?: string; imageMediaMetadata?: { width?: number; height?: number } } =>
      Boolean(file.id),
    )
    .map((file) => ({
      id: file.id,
      name: file.name?.trim() || "Untitled",
      mimeType: file.mimeType || "image/png",
      size: file.size ? Number(file.size) || null : null,
      modifiedTime: file.modifiedTime ?? null,
      width: file.imageMediaMetadata?.width ?? null,
      height: file.imageMediaMetadata?.height ?? null,
    }));

  return {
    files,
    nextPageToken: data.nextPageToken ?? null,
  };
}

export async function downloadGoogleDriveFile(
  accessToken: string,
  fileId: string,
): Promise<{ bytes: Buffer; mimeType: string; name: string }> {
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!metaRes.ok) {
    const text = await metaRes.text();
    throw new Error(`Drive file meta failed: ${text.slice(0, 200)}`);
  }
  const meta = (await metaRes.json()) as {
    id?: string;
    name?: string;
    mimeType?: string;
  };
  if (!meta.id) throw new Error("Drive file not found");
  if (!meta.mimeType?.startsWith("image/")) {
    throw new Error("Drive file is not an image");
  }

  const mediaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!mediaRes.ok) {
    const text = await mediaRes.text();
    throw new Error(`Drive download failed: ${text.slice(0, 200)}`);
  }

  const bytes = Buffer.from(await mediaRes.arrayBuffer());
  return {
    bytes,
    mimeType: meta.mimeType || "image/png",
    name: meta.name?.trim() || "Drive image",
  };
}

/** Small preview for gallery tiles (Drive thumbnail endpoint). */
export async function fetchGoogleDriveThumbnail(
  accessToken: string,
  fileId: string,
  size = 400,
): Promise<{ bytes: Buffer; mimeType: string } | null> {
  const params = new URLSearchParams({
    fields: "thumbnailLink",
  });
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!metaRes.ok) return null;
  const meta = (await metaRes.json()) as { thumbnailLink?: string };
  if (!meta.thumbnailLink) return null;

  // Request a specific size when the link supports `=s*` suffix.
  const thumbUrl = meta.thumbnailLink.replace(/=s\d+$/, `=s${size}`);
  const thumbRes = await fetch(thumbUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!thumbRes.ok) return null;
  const mimeType = thumbRes.headers.get("content-type") || "image/jpeg";
  return {
    bytes: Buffer.from(await thumbRes.arrayBuffer()),
    mimeType,
  };
}
