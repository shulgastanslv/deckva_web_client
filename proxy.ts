import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { UserRole } from "@/lib/roles";

/**
 * Edge gate: landing stays public; studio, admin, and expensive API routes
 * require a session. API calls get 401 JSON; page navigations redirect home
 * with the auth modal open.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.searchParams.set("auth", "1");
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    if (token.role !== UserRole.ADMIN) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/studio",
    "/studio/:path*",
    "/admin",
    "/admin/:path*",
    "/api/ai/:path*",
    "/api/tools/:path*",
  ],
};
