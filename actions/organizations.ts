"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { userHasPro } from "@/lib/billing/entitlements";
import { prisma } from "@/lib/prisma";

export interface OrganizationListItem {
  id: string;
  isUpgrade: boolean;
  name: string;
  color: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
}

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

const ORG_COLORS = [
  "#7EB6FF",
  "#C4B5FD",
  "#86EFAC",
  "#FCD34D",
  "#FDA4AF",
  "#67E8F9",
] as const;

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

function pickColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i) * 17) % 97;
  return ORG_COLORS[hash % ORG_COLORS.length];
}

async function mapOrg(
  org: {
    id: string;
    name: string;
    color: string;
    members: Array<{ role: "OWNER" | "ADMIN" | "MEMBER"; userId: string }>;
    _count: { members: number };
  },
  userId: string,
): Promise<OrganizationListItem> {
  const mine = org.members.find((m) => m.userId === userId);
  return {
    id: org.id,
    name: org.name,
    isUpgrade: await userHasPro(userId),
    color: org.color,
    role: mine?.role ?? "MEMBER",
    memberCount: org._count.members,
  };
}

/** Ensures the user has at least one org and an active selection. */
export async function ensureUserOrganization(): Promise<
  ActionResult<{ organization: OrganizationListItem }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        activeOrganizationId: true,
      },
    });
    if (!user) return { success: false, error: "User not found" };

    let memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            members: { select: { role: true, userId: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (memberships.length === 0) {
      const name =
        user.name?.trim() ||
        user.email?.split("@")[0] ||
        "Personal";
      const org = await prisma.organization.create({
        data: {
          name,
          color: pickColor(userId),
          members: {
            create: { userId, role: "OWNER" },
          },
        },
        include: {
          members: { select: { role: true, userId: true } },
          _count: { select: { members: true } },
        },
      });

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { activeOrganizationId: org.id },
        }),
        prisma.folder.updateMany({
          where: { userId, organizationId: null },
          data: { organizationId: org.id },
        }),
        prisma.project.updateMany({
          where: { userId, organizationId: null },
          data: { organizationId: org.id },
        }),
      ]);

      return { success: true, organization: await mapOrg(org, userId) };
    }

    const activeId = user.activeOrganizationId;
    const activeMembership =
      memberships.find((m) => m.organizationId === activeId) ??
      memberships[0]!;

    if (user.activeOrganizationId !== activeMembership.organizationId) {
      await prisma.user.update({
        where: { id: userId },
        data: { activeOrganizationId: activeMembership.organizationId },
      });
    }

    // Backfill orphaned personal content into the active org once.
    await prisma.$transaction([
      prisma.folder.updateMany({
        where: { userId, organizationId: null },
        data: { organizationId: activeMembership.organizationId },
      }),
      prisma.project.updateMany({
        where: { userId, organizationId: null },
        data: { organizationId: activeMembership.organizationId },
      }),
    ]);

    return {
      success: true,
      organization: await mapOrg(activeMembership.organization, userId),
    };
  } catch (err) {
    console.error("ensureUserOrganization error:", err);
    return { success: false, error: "Couldn't load organization" };
  }
}

export async function getUserOrganizations(): Promise<
  ActionResult<{
    organizations: OrganizationListItem[];
    activeOrganizationId: string | null;
  }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    await ensureUserOrganization();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { activeOrganizationId: true },
    });

    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            members: { select: { role: true, userId: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const organizations = await Promise.all(
      memberships.map((m) => mapOrg(m.organization, userId)),
    );

    return {
      success: true,
      organizations,
      activeOrganizationId: user?.activeOrganizationId ?? null,
    };
  } catch (err) {
    console.error("getUserOrganizations error:", err);
    return { success: false, error: "Couldn't load organizations" };
  }
}

export async function createOrganization(
  name?: string,
): Promise<ActionResult<{ organization: OrganizationListItem }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const trimmed = name?.trim() || "New organization";
    const org = await prisma.organization.create({
      data: {
        name: trimmed,
        color: pickColor(`${userId}-${trimmed}`),
        members: { create: { userId, role: "OWNER" } },
      },
      include: {
        members: { select: { role: true, userId: true } },
        _count: { select: { members: true } },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { activeOrganizationId: org.id },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/projects");

    return { success: true, organization: await mapOrg(org, userId) };
  } catch (err) {
    console.error("createOrganization error:", err);
    return { success: false, error: "Couldn't create organization" };
  }
}

export async function setActiveOrganization(
  organizationId: string,
): Promise<ActionResult<{ organizationId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const membership = await prisma.organizationMember.findFirst({
      where: { userId, organizationId },
    });
    if (!membership) return { success: false, error: "Organization not found" };

    await prisma.user.update({
      where: { id: userId },
      data: { activeOrganizationId: organizationId },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/projects");

    return { success: true, organizationId };
  } catch (err) {
    console.error("setActiveOrganization error:", err);
    return { success: false, error: "Couldn't switch organization" };
  }
}

export async function getActiveOrganization(): Promise<
  ActionResult<{ organization: OrganizationListItem | null }>
> {
  try {
    const ensured = await ensureUserOrganization();
    if (!ensured.success) return ensured;
    return { success: true, organization: ensured.organization };
  } catch (err) {
    console.error("getActiveOrganization error:", err);
    return { success: false, error: "Couldn't load organization" };
  }
}
