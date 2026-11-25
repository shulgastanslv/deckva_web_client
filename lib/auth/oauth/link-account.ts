import type { User as DbUser } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function isUniqueEmail(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

export type OAuthProfileInput = {
  email: string;
  name?: string | null;
  image?: string | null;
};

/**
 * One User row per email across all OAuth connectors.
 * Preserves admin-provisioned `role` / `name` when the account already exists.
 */
export async function linkOAuthAccount(
  input: OAuthProfileInput,
): Promise<DbUser> {
  const now = new Date();
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (!existing) {
    try {
      return await prisma.user.create({
        data: {
          email: input.email,
          name: input.name || null,
          image: input.image || null,
          lastSignedInAt: now,
        },
      });
    } catch (err) {
      if (!isUniqueEmail(err)) throw err;
      const raced = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!raced) throw err;
      return mergeOAuthProfile(raced, input, now);
    }
  }
  return mergeOAuthProfile(existing, input, now);
}

async function mergeOAuthProfile(
  existing: DbUser,
  input: Pick<OAuthProfileInput, "name" | "image">,
  signedInAt: Date,
): Promise<DbUser> {
  // Keep admin-set name when present; still refresh avatar from the IdP.
  const name = existing.name ?? input.name ?? null;
  const image = input.image ?? existing.image ?? null;
  return prisma.user.update({
    where: { id: existing.id },
    data: { name, image, lastSignedInAt: signedInAt },
  });
}
