import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { messages } from "@/lib/messages";

/** Require a signed-in user for App Router API handlers. */
export async function requireApiSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { error: messages.errors.unauthorized },
        { status: 401 },
      ),
    } as const;
  }
  return { session, error: null } as const;
}
