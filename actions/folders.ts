"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { revalidatePath } from "next/cache";

import { ensureUserOrganization } from "@/actions/organizations";
import { userHasPro } from "@/lib/billing/entitlements";
import { prisma } from "@/lib/prisma";
import {
  canAccessOrgResource,
  canManageOrgResource,
} from "@/lib/studio/org-access";

export interface FolderListItem {
  id: string;
  name: string;
  projectCount: number;
  updatedAt: string;
}

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };


export async function getUserFolders(): Promise<
  ActionResult<{ folders: FolderListItem[] }>
> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const ensured = await ensureUserOrganization();
    if (!ensured.success) {
      return { success: false, error: messages.errors.loadOrganization };
    }
    const organizationId = ensured.organization.id;

    const folders = await prisma.folder.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { projects: true } } },
    });

    return {
      success: true,
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        projectCount: f._count.projects,
        updatedAt: f.updatedAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("getUserFolders error:", err);
    return { success: false, error: messages.errors.loadFolders };
  }
}

export async function createFolder(
  name?: string,
): Promise<ActionResult<{ folder: FolderListItem }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const ensured = await ensureUserOrganization();
    if (!ensured.success) {
      return { success: false, error: messages.errors.loadOrganization };
    }
    if (!(await userHasPro(userId))) {
      return {
        success: false,
        error: messages.errors.upgradeFolders,
      };
    }

    const organizationId = ensured.organization.id;
    const trimmed = name?.trim() || "Untitled folder";

    const folder = await prisma.folder.create({
      data: { userId, name: trimmed, organizationId },
      include: { _count: { select: { projects: true } } },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return {
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        projectCount: folder._count.projects,
        updatedAt: folder.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("createFolder error:", err);
    return { success: false, error: messages.errors.createFolder };
  }
}

export async function renameFolder(
  folderId: string,
  name: string,
): Promise<ActionResult<{ folder: FolderListItem }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const trimmed = name.trim();
    if (!folderId || !trimmed) {
      return { success: false, error: messages.errors.nameRequired };
    }

    const existing = await prisma.folder.findFirst({
      where: { id: folderId },
    });
    if (!existing || !(await canAccessOrgResource(userId, existing))) {
      return { success: false, error: messages.errors.folderNotFound };
    }

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: { name: trimmed },
      include: { _count: { select: { projects: true } } },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return {
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        projectCount: folder._count.projects,
        updatedAt: folder.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("renameFolder error:", err);
    return { success: false, error: messages.errors.renameFolder };
  }
}

export async function deleteFolder(
  folderId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!folderId) return { success: false, error: messages.errors.folderIdRequired };

    const existing = await prisma.folder.findFirst({
      where: { id: folderId },
    });
    if (!existing || !(await canManageOrgResource(userId, existing))) {
      return { success: false, error: messages.errors.folderNotFound };
    }

    await prisma.folder.delete({ where: { id: folderId } });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return { success: true };
  } catch (err) {
    console.error("deleteFolder error:", err);
    return { success: false, error: messages.errors.deleteFolder };
  }
}

export async function moveProjectToFolder(
  projectId: string,
  folderId: string | null,
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };

    const project = await prisma.project.findFirst({
      where: { id: projectId },
    });
    if (!project || !(await canAccessOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId },
      });
      if (!folder || !(await canAccessOrgResource(userId, folder))) {
        return { success: false, error: messages.errors.folderNotFound };
      }
      if (
        folder.organizationId &&
        project.organizationId &&
        folder.organizationId !== project.organizationId
      ) {
        return { success: false, error: messages.errors.moveProject };
      }
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { folderId },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return { success: true };
  } catch (err) {
    console.error("moveProjectToFolder error:", err);
    return { success: false, error: messages.errors.moveProject };
  }
}
