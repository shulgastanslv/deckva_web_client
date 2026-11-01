"use server";

import { messages } from "@/lib/messages";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { ensureUserOrganization } from "@/actions/organizations";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { userHasPro } from "@/lib/billing/entitlements";
import { prisma } from "@/lib/prisma";

export interface FolderListItem {
  id: string;
  name: string;
  projectCount: number;
  updatedAt: string;
}

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

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
      where: { userId, organizationId },
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
    revalidatePath("/studio/projects");

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
      where: { id: folderId, userId },
    });
    if (!existing) return { success: false, error: messages.errors.folderNotFound };

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: { name: trimmed },
      include: { _count: { select: { projects: true } } },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/projects");

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
      where: { id: folderId, userId },
    });
    if (!existing) return { success: false, error: messages.errors.folderNotFound };

    await prisma.folder.delete({ where: { id: folderId } });

    revalidatePath("/studio");
    revalidatePath("/studio/projects");

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
      where: { id: projectId, userId },
    });
    if (!project) return { success: false, error: messages.errors.projectNotFound };

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });
      if (!folder) return { success: false, error: messages.errors.folderNotFound };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { folderId },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/projects");

    return { success: true };
  } catch (err) {
    console.error("moveProjectToFolder error:", err);
    return { success: false, error: messages.errors.moveProject };
  }
}
