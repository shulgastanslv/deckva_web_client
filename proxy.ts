import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  AUTH_USER_ID_HEADER,
  AUTH_USER_ROLE_HEADER,
} from "@/lib/auth/headers";
import { UserRole } from "@/lib/roles";

/**
 * Verifies the session JWT once, injects user headers for Server Actions / RSC,
 * and redirects anonymous users away from studio/admin.
 *
 * Landing and other public routes still run through proxy so actions can read
 * the same verified headers — spoofed x-deckva-* values are always stripped.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(AUTH_USER_ID_HEADER);
  requestHeaders.delete(AUTH_USER_ROLE_HEADER);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  const userId =
    (typeof token?.id === "string" && token.id) ||
    (typeof token?.sub === "string" && token.sub) ||
    null;

  if (userId) {
    requestHeaders.set(AUTH_USER_ID_HEADER, userId);
    if (typeof token?.role === "string" && token.role) {
      requestHeaders.set(AUTH_USER_ROLE_HEADER, token.role);
    }
  }

  const needsAuth =
    pathname === "/studio" ||
    pathname.startsWith("/studio/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (needsAuth && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.searchParams.set("auth", "1");
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (
    (pathname === "/admin" || pathname.startsWith("/admin/")) &&
    token?.role !== UserRole.ADMIN
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * All app navigations + Server Action POSTs, except NextAuth routes,
     * Next internals, and static files.
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
