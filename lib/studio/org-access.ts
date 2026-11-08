import { prisma } from "@/lib/prisma";
import { isOrgManager } from "@/lib/roles";

/** Organization ids the user belongs to. */
export async function userOrganizationIds(userId: string): Promise<string[]> {
  const rows = await prisma.organizationMember.findMany({
    where: { userId },
    select: { organizationId: true },
  });
  return rows.map((row) => row.organizationId);
}

export async function isOrganizationMember(
  userId: string,
  organizationId: string | null | undefined,
): Promise<boolean> {
  if (!organizationId) return false;
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
    select: { id: true },
  });
  return Boolean(membership);
}

/** Owner or any member of the resource's organization. */
export async function canAccessOrgResource(
  userId: string,
  resource: { userId: string; organizationId: string | null },
): Promise<boolean> {
  if (resource.userId === userId) return true;
  return isOrganizationMember(userId, resource.organizationId);
}

/** Project owner, or OWNER/ADMIN of the project's organization. */
export async function canManageOrgResource(
  userId: string,
  resource: { userId: string; organizationId: string | null },
): Promise<boolean> {
  if (resource.userId === userId) return true;
  if (!resource.organizationId) return false;
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId: resource.organizationId },
    select: { role: true },
  });
  return isOrgManager(membership?.role);
}
