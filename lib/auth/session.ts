import { headers } from "next/headers";

import {
  AUTH_USER_ID_HEADER,
  AUTH_USER_ROLE_HEADER,
} from "@/lib/auth/headers";

export { AUTH_USER_ID_HEADER, AUTH_USER_ROLE_HEADER } from "@/lib/auth/headers";

/** Signed-in user id for Server Actions / RSC. `null` when anonymous. */
export async function getUserId(): Promise<string | null> {
  const h = await headers();
  const id = h.get(AUTH_USER_ID_HEADER)?.trim();
  return id || null;
}

/** Platform role from the verified JWT, when present. */
export async function getUserRole(): Promise<string | null> {
  const h = await headers();
  const role = h.get(AUTH_USER_ROLE_HEADER)?.trim();
  return role || null;
}

/** Alias used by Server Actions (same as getUserId). */
export async function requireUserId(): Promise<string | null> {
  return getUserId();
}
