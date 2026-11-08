"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { revalidatePath } from "next/cache";

import { userHasPro } from "@/lib/billing/entitlements";
import { prisma } from "@/lib/prisma";
import {
  isOrgManager,
  OrgMemberRole,
  type InviteableOrgRole,
  type OrgMemberRole as OrgMemberRoleValue,
} from "@/lib/roles";

export interface OrganizationListItem {
  id: string;
  isUpgrade: boolean;
  name: string;
  color: string;
  role: OrgMemberRoleValue;
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
    members: Array<{ role: OrgMemberRoleValue; userId: string }>;
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
    role: mine?.role ?? OrgMemberRole.MEMBER,
    memberCount: org._count.members,
  };
}

/** Ensures the user has at least one org and an active selection. */
export async function ensureUserOrganization(): Promise<
  ActionResult<{ organization: OrganizationListItem }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        activeOrganizationId: true,
      },
    });
    if (!user) return { success: false, error: messages.errors.userNotFound };

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
            create: { userId, role: OrgMemberRole.OWNER },
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
    return { success: false, error: messages.errors.loadOrganization };
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
    if (!userId) return { success: false, error: messages.errors.signIn };

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
    return { success: false, error: messages.errors.loadOrganizations };
  }
}

export async function createOrganization(
  name?: string,
): Promise<ActionResult<{ organization: OrganizationListItem }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const trimmed = name?.trim() || "New organization";
    const org = await prisma.organization.create({
      data: {
        name: trimmed,
        color: pickColor(`${userId}-${trimmed}`),
        members: { create: { userId, role: OrgMemberRole.OWNER } },
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
    revalidatePath("/studio/browse");

    return { success: true, organization: await mapOrg(org, userId) };
  } catch (err) {
    console.error("createOrganization error:", err);
    return { success: false, error: messages.errors.createOrganization };
  }
}

export async function setActiveOrganization(
  organizationId: string,
): Promise<ActionResult<{ organizationId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const membership = await prisma.organizationMember.findFirst({
      where: { userId, organizationId },
    });
    if (!membership) return { success: false, error: messages.errors.organizationNotFound };

    await prisma.user.update({
      where: { id: userId },
      data: { activeOrganizationId: organizationId },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return { success: true, organizationId };
  } catch (err) {
    console.error("setActiveOrganization error:", err);
    return { success: false, error: messages.errors.switchOrganization };
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
    return { success: false, error: messages.errors.loadOrganization };
  }
}


// Добавьте это в конец файла @/actions/organizations.ts

export type OrganizationMemberItem = {
  id: string;
  role: OrgMemberRoleValue;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export async function updateOrganization(
  organizationId: string,
  data: { name?: string; color?: string },
): Promise<ActionResult<{ organizationId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const membership = await prisma.organizationMember.findFirst({
      where: { userId, organizationId },
    });

    if (
      !membership ||
      (!isOrgManager(membership.role))
    ) {
      return { success: false, error: messages.errors.orgEditForbidden };
    }

    const name = data.name?.trim();
    if (data.name !== undefined && (!name || name.length < 2)) {
      return { success: false, error: messages.errors.nameRequired };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(name ? { name } : {}),
        ...(data.color ? { color: data.color } : {}),
      },
    });

    revalidatePath("/studio");
    return { success: true, organizationId };
  } catch (err) {
    console.error("updateOrganization error:", err);
    return { success: false, error: messages.errors.updateOrganization };
  }
}

export async function deleteOrganization(
  organizationId: string,
): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const membership = await prisma.organizationMember.findFirst({
      where: { userId, organizationId },
    });

    if (!membership || membership.role !== OrgMemberRole.OWNER) {
      return { success: false, error: messages.errors.orgDeleteForbidden };
    }

    await prisma.organization.delete({
      where: { id: organizationId },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.activeOrganizationId === organizationId) {
      await prisma.user.update({
        where: { id: userId },
        data: { activeOrganizationId: null },
      });
      await ensureUserOrganization();
    }

    revalidatePath("/studio");
    return { success: true };
  } catch (err) {
    console.error("deleteOrganization error:", err);
    return { success: false, error: messages.errors.deleteOrganization };
  }
}

export async function getOrganizationMembers(
  organizationId: string,
): Promise<ActionResult<{ members: OrganizationMemberItem[] }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const membership = await prisma.organizationMember.findFirst({
      where: { userId, organizationId },
    });
    if (!membership) {
      return { success: false, error: messages.errors.organizationNotFound };
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    return {
      success: true,
      members: members.map((member) => ({
        id: member.id,
        role: member.role,
        createdAt: member.createdAt.toISOString(),
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image,
        },
      })),
    };
  } catch (err) {
    console.error("getOrganizationMembers error:", err);
    return { success: false, error: messages.errors.loadOrgMembers };
  }
}

export async function updateOrganizationMemberRole(input: {
  organizationId: string;
  memberUserId: string;
  role: InviteableOrgRole;
}): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const actor = await prisma.organizationMember.findFirst({
      where: { userId, organizationId: input.organizationId },
    });
    if (!actor || actor.role !== OrgMemberRole.OWNER) {
      return { success: false, error: messages.errors.orgRoleForbidden };
    }

    if (input.memberUserId === userId) {
      return { success: false, error: messages.errors.orgRoleSelf };
    }

    const target = await prisma.organizationMember.findFirst({
      where: {
        userId: input.memberUserId,
        organizationId: input.organizationId,
      },
    });
    if (!target) {
      return { success: false, error: messages.errors.orgMemberNotFound };
    }
    if (target.role === OrgMemberRole.OWNER) {
      return { success: false, error: messages.errors.orgRoleOwner };
    }

    await prisma.organizationMember.update({
      where: { id: target.id },
      data: { role: input.role },
    });

    revalidatePath("/studio");
    return { success: true };
  } catch (err) {
    console.error("updateOrganizationMemberRole error:", err);
    return { success: false, error: messages.errors.updateOrgMember };
  }
}

export async function removeOrganizationMember(input: {
  organizationId: string;
  memberUserId: string;
}): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const actor = await prisma.organizationMember.findFirst({
      where: { userId, organizationId: input.organizationId },
    });
    if (!actor) {
      return { success: false, error: messages.errors.organizationNotFound };
    }

    const target = await prisma.organizationMember.findFirst({
      where: {
        userId: input.memberUserId,
        organizationId: input.organizationId,
      },
    });
    if (!target) {
      return { success: false, error: messages.errors.orgMemberNotFound };
    }

    const removingSelf = input.memberUserId === userId;
    if (removingSelf) {
      if (actor.role === OrgMemberRole.OWNER) {
        return { success: false, error: messages.errors.orgOwnerLeave };
      }
    } else if (!isOrgManager(actor.role)) {
      return { success: false, error: messages.errors.orgRemoveForbidden };
    } else if (target.role === OrgMemberRole.OWNER) {
      return { success: false, error: messages.errors.orgRemoveOwner };
    } else if (actor.role === OrgMemberRole.ADMIN && target.role === OrgMemberRole.ADMIN) {
      return { success: false, error: messages.errors.orgRemoveForbidden };
    }

    await prisma.organizationMember.delete({ where: { id: target.id } });

    if (removingSelf) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { activeOrganizationId: true },
      });
      if (user?.activeOrganizationId === input.organizationId) {
        await prisma.user.update({
          where: { id: userId },
          data: { activeOrganizationId: null },
        });
        await ensureUserOrganization();
      }
    } else {
      await prisma.user.updateMany({
        where: {
          id: input.memberUserId,
          activeOrganizationId: input.organizationId,
        },
        data: { activeOrganizationId: null },
      });
    }

    revalidatePath("/studio");
    return { success: true };
  } catch (err) {
    console.error("removeOrganizationMember error:", err);
    return { success: false, error: messages.errors.removeOrgMember };
  }
}

export async function transferOrganizationOwnership(input: {
  organizationId: string;
  memberUserId: string;
}): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    if (input.memberUserId === userId) {
      return { success: false, error: messages.errors.orgRoleSelf };
    }

    const actor = await prisma.organizationMember.findFirst({
      where: { userId, organizationId: input.organizationId },
    });
    if (!actor || actor.role !== OrgMemberRole.OWNER) {
      return { success: false, error: messages.errors.orgTransferForbidden };
    }

    const target = await prisma.organizationMember.findFirst({
      where: {
        userId: input.memberUserId,
        organizationId: input.organizationId,
      },
    });
    if (!target) {
      return { success: false, error: messages.errors.orgMemberNotFound };
    }

    await prisma.$transaction([
      prisma.organizationMember.update({
        where: { id: actor.id },
        data: { role: OrgMemberRole.ADMIN },
      }),
      prisma.organizationMember.update({
        where: { id: target.id },
        data: { role: OrgMemberRole.OWNER },
      }),
    ]);

    revalidatePath("/studio");
    return { success: true };
  } catch (err) {
    console.error("transferOrganizationOwnership error:", err);
    return { success: false, error: messages.errors.transferOrganization };
  }
}