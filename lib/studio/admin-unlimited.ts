import { prisma } from "@/lib/prisma";
import { UserRole, isPlatformAdmin } from "@/lib/roles";

/** Persist platform-admin role + unlimited generations flag on the user row. */
export async function promotePlatformAdmin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: UserRole.ADMIN,
      unlimitedGenerations: true,
    },
  });
}

/**
 * Source of truth for generation bypass: `User.unlimitedGenerations`.
 * Heals lagging admin rows that still have the role but missing flag.
 */
export async function resolveUnlimitedGenerations(user: {
  id: string;
  role: string;
  unlimitedGenerations: boolean;
}): Promise<boolean> {
  if (user.unlimitedGenerations) return true;
  if (!isPlatformAdmin(user.role)) return false;
  await promotePlatformAdmin(user.id);
  return true;
}
