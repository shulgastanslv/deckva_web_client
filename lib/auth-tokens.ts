import { createHash, randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

export const AuthTokenType = {
  verify: "verify",
  reset: "reset",
} as const;

export type AuthTokenType = (typeof AuthTokenType)[keyof typeof AuthTokenType];

const TTL_MS: Record<AuthTokenType, number> = {
  [AuthTokenType.verify]: 24 * 60 * 60 * 1000,
  [AuthTokenType.reset]: 60 * 60 * 1000,
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueAuthToken(
  email: string,
  type: AuthTokenType,
  userId?: string,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TTL_MS[type]);

  await prisma.authToken.deleteMany({ where: { email, type } });
  await prisma.authToken.create({
    data: { email, type, tokenHash, expiresAt, userId },
  });

  return token;
}

export async function consumeAuthToken(
  token: string,
  type: AuthTokenType,
): Promise<{ email: string } | null> {
  const tokenHash = hashToken(token.trim());
  const row = await prisma.authToken.findUnique({ where: { tokenHash } });
  if (!row || row.type !== type) return null;

  await prisma.authToken.delete({ where: { id: row.id } });
  if (row.expiresAt.getTime() < Date.now()) return null;
  return { email: row.email };
}
