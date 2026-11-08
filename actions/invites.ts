"use server";

import { randomBytes } from "node:crypto";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import {
  appBaseUrl,
  isValidEmail,
  normalizeEmail,
  sendAuthEmail,
} from "@/lib/email";
import {
  InviteSendStatus,
  OrganizationInviteStatus,
  type InviteSendStatus as InviteSendStatusValue,
} from "@/lib/domain/invites";
import { messages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import {
  isOrgManager,
  OrgMemberRole,
  type InviteableOrgRole,
  type OrgMemberRole as OrgMemberRoleValue,
} from "@/lib/roles";

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

export type InvitePreview = {
  token: string;
  organizationId: string;
  organizationName: string;
  organizationColor: string;
  role: OrgMemberRoleValue;
  email: string | null;
  invitedByName: string | null;
  expiresAt: string;
  alreadyMember: boolean;
  expired: boolean;
  revoked: boolean;
  accepted: boolean;
};

export type InviteSendResult = {
  email: string;
  status: InviteSendStatusValue;
};

const OPEN_INVITE_DAYS = 365;
const EMAIL_INVITE_DAYS = 14;

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

function inviteUrl(token: string) {
  return `${appBaseUrl()}/invite/${token}`;
}

async function requireOrgAdmin(userId: string, organizationId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
  });
  if (!membership) return null;
  if (!isOrgManager(membership.role)) return null;
  return membership;
}

async function notifyUser(input: {
  userId: string;
  title: string;
  body: string;
  href?: string | null;
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
    },
  });
}

function parseEmails(raw: string): string[] {
  const parts = raw
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const unique = new Set<string>();
  for (const part of parts) {
    if (!isValidEmail(part)) continue;
    unique.add(normalizeEmail(part));
  }
  return [...unique];
}

export async function getOrCreateInviteLink(
  organizationId: string,
): Promise<ActionResult<{ url: string; token: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const admin = await requireOrgAdmin(userId, organizationId);
    if (!admin) return { success: false, error: messages.errors.inviteForbidden };

    const existing = await prisma.organizationInvite.findFirst({
      where: {
        organizationId,
        email: null,
        status: OrganizationInviteStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return {
        success: true,
        url: inviteUrl(existing.token),
        token: existing.token,
      };
    }

    const token = newToken();
    const invite = await prisma.organizationInvite.create({
      data: {
        token,
        email: null,
        role: OrgMemberRole.MEMBER,
        organizationId,
        invitedById: userId,
        expiresAt: new Date(Date.now() + OPEN_INVITE_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      url: inviteUrl(invite.token),
      token: invite.token,
    };
  } catch (err) {
    console.error("getOrCreateInviteLink error:", err);
    return { success: false, error: messages.errors.inviteFailed };
  }
}

export async function sendOrganizationInvites(input: {
  organizationId: string;
  emails: string;
  role?: InviteableOrgRole;
}): Promise<ActionResult<{ results: InviteSendResult[]; invited: number }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const admin = await requireOrgAdmin(userId, input.organizationId);
    if (!admin) return { success: false, error: messages.errors.inviteForbidden };

    const role = input.role === OrgMemberRole.ADMIN ? OrgMemberRole.ADMIN : OrgMemberRole.MEMBER;
    const emails = parseEmails(input.emails);
    if (emails.length === 0) {
      return { success: false, error: messages.errors.validEmail };
    }

    const org = await prisma.organization.findUnique({
      where: { id: input.organizationId },
      select: { id: true, name: true },
    });
    if (!org) return { success: false, error: messages.errors.organizationNotFound };

    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const inviterName =
      inviter?.name?.trim() || inviter?.email?.split("@")[0] || "Someone";

    const results: InviteSendResult[] = [];
    let invited = 0;

    for (const email of emails) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        const already = await prisma.organizationMember.findFirst({
          where: { userId: existingUser.id, organizationId: org.id },
        });
        if (already) {
          results.push({ email, status: InviteSendStatus.already_member });
          continue;
        }
      }

      const pending = await prisma.organizationInvite.findFirst({
        where: {
          organizationId: org.id,
          email,
          status: OrganizationInviteStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
      });

      const invite =
        pending ??
        (await prisma.organizationInvite.create({
          data: {
            token: newToken(),
            email,
            role,
            organizationId: org.id,
            invitedById: userId,
            expiresAt: new Date(
              Date.now() + EMAIL_INVITE_DAYS * 24 * 60 * 60 * 1000,
            ),
          },
        }));

      const url = inviteUrl(invite.token);

      if (existingUser) {
        await notifyUser({
          userId: existingUser.id,
          title: `Join ${org.name}`,
          body: `${inviterName} invited you to join **${org.name}** as ${role.toLowerCase()}.`,
          href: `/invite/${invite.token}`,
        });
        results.push({ email, status: InviteSendStatus.notified });
      } else {
        await sendAuthEmail({
          to: email,
          subject: `Join ${org.name} on Deckva`,
          text: `${inviterName} invited you to join ${org.name} on Deckva.\n\nOpen this link to accept:\n${url}`,
          html: `<p><strong>${inviterName}</strong> invited you to join <strong>${org.name}</strong> on Deckva.</p><p><a href="${url}">Accept invite</a></p>`,
        });
        results.push({ email, status: InviteSendStatus.invited });
      }

      invited += 1;
    }

    revalidatePath("/studio");
    return { success: true, results, invited };
  } catch (err) {
    console.error("sendOrganizationInvites error:", err);
    return { success: false, error: messages.errors.inviteFailed };
  }
}

export async function getInvitePreview(
  token: string,
): Promise<ActionResult<{ invite: InvitePreview }>> {
  try {
    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: {
        organization: { select: { id: true, name: true, color: true } },
        invitedBy: { select: { name: true, email: true } },
      },
    });
    if (!invite) return { success: false, error: messages.errors.inviteNotFound };

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    let alreadyMember = false;
    if (userId) {
      const membership = await prisma.organizationMember.findFirst({
        where: { userId, organizationId: invite.organizationId },
      });
      alreadyMember = Boolean(membership);
    }

    const expired =
      invite.status === OrganizationInviteStatus.EXPIRED || invite.expiresAt.getTime() < Date.now();

    return {
      success: true,
      invite: {
        token: invite.token,
        organizationId: invite.organization.id,
        organizationName: invite.organization.name,
        organizationColor: invite.organization.color,
        role: invite.role,
        email: invite.email,
        invitedByName:
          invite.invitedBy.name?.trim() ||
          invite.invitedBy.email?.split("@")[0] ||
          null,
        expiresAt: invite.expiresAt.toISOString(),
        alreadyMember,
        expired,
        revoked: invite.status === OrganizationInviteStatus.REVOKED,
        accepted: invite.status === OrganizationInviteStatus.ACCEPTED,
      },
    };
  } catch (err) {
    console.error("getInvitePreview error:", err);
    return { success: false, error: messages.errors.inviteNotFound };
  }
}

export async function acceptOrganizationInvite(
  token: string,
): Promise<ActionResult<{ organizationId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user?.email) return { success: false, error: messages.errors.userNotFound };

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    });
    if (!invite) return { success: false, error: messages.errors.inviteNotFound };

    if (invite.status === OrganizationInviteStatus.REVOKED) {
      return { success: false, error: messages.errors.inviteRevoked };
    }
    if (invite.status === OrganizationInviteStatus.ACCEPTED && invite.email) {
      return { success: false, error: messages.errors.inviteUsed };
    }
    if (invite.expiresAt.getTime() < Date.now() || invite.status === OrganizationInviteStatus.EXPIRED) {
      if (invite.status === OrganizationInviteStatus.PENDING) {
        await prisma.organizationInvite.update({
          where: { id: invite.id },
          data: { status: OrganizationInviteStatus.EXPIRED },
        });
      }
      return { success: false, error: messages.errors.inviteExpired };
    }

    if (invite.email && normalizeEmail(invite.email) !== normalizeEmail(user.email)) {
      return { success: false, error: messages.errors.inviteEmailMismatch };
    }

    const existing = await prisma.organizationMember.findFirst({
      where: { userId, organizationId: invite.organizationId },
    });

    if (!existing) {
      const role = invite.role === OrgMemberRole.OWNER ? OrgMemberRole.MEMBER : invite.role;
      await prisma.organizationMember.create({
        data: {
          userId,
          organizationId: invite.organizationId,
          role,
        },
      });
    }

    if (invite.email) {
      await prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: OrganizationInviteStatus.ACCEPTED },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { activeOrganizationId: invite.organizationId },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return { success: true, organizationId: invite.organizationId };
  } catch (err) {
    console.error("acceptOrganizationInvite error:", err);
    return { success: false, error: messages.errors.inviteAcceptFailed };
  }
}

export async function declineOrganizationInvite(
  token: string,
): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user?.email) return { success: false, error: messages.errors.userNotFound };

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    });
    if (!invite) return { success: false, error: messages.errors.inviteNotFound };

    if (
      invite.email &&
      normalizeEmail(invite.email) !== normalizeEmail(user.email)
    ) {
      return { success: false, error: messages.errors.inviteEmailMismatch };
    }

    if (invite.email && invite.status === OrganizationInviteStatus.PENDING) {
      await prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: OrganizationInviteStatus.REVOKED },
      });
    }

    return { success: true };
  } catch (err) {
    console.error("declineOrganizationInvite error:", err);
    return { success: false, error: messages.errors.inviteDeclineFailed };
  }
}

export async function listOrganizationInvites(
  organizationId: string,
): Promise<
  ActionResult<{
    invites: Array<{
      id: string;
      email: string | null;
      role: OrgMemberRoleValue;
      status: string;
      createdAt: string;
      expiresAt: string;
      url: string;
    }>;
  }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const admin = await requireOrgAdmin(userId, organizationId);
    if (!admin) return { success: false, error: messages.errors.inviteForbidden };

    const rows = await prisma.organizationInvite.findMany({
      where: {
        organizationId,
        status: OrganizationInviteStatus.PENDING,
        expiresAt: { gt: new Date() },
        email: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      invites: rows.map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        expiresAt: row.expiresAt.toISOString(),
        url: inviteUrl(row.token),
      })),
    };
  } catch (err) {
    console.error("listOrganizationInvites error:", err);
    return { success: false, error: messages.errors.inviteFailed };
  }
}

export async function revokeOrganizationInvite(
  inviteId: string,
): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const invite = await prisma.organizationInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite) return { success: false, error: messages.errors.inviteNotFound };

    const admin = await requireOrgAdmin(userId, invite.organizationId);
    if (!admin) return { success: false, error: messages.errors.inviteForbidden };

    await prisma.organizationInvite.update({
      where: { id: inviteId },
      data: { status: OrganizationInviteStatus.REVOKED },
    });

    return { success: true };
  } catch (err) {
    console.error("revokeOrganizationInvite error:", err);
    return { success: false, error: messages.errors.inviteFailed };
  }
}
