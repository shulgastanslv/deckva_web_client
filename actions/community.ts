"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

import { requireUserId } from "@/lib/auth/session";
import { emailIsAdmin } from "@/lib/auth-role";
import { ensureUserOrganization } from "@/actions/organizations";
import {
  isCommunityCategory,
  type CommunityCategory,
  type CommunitySortId,
} from "@/lib/community/categories";
import { messages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/roles";
import { canManageOrgResource } from "@/lib/studio/org-access";

export type CommunityReviewStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type CommunityProjectListItem = {
  id: string;
  title: string;
  aspectRatio: string;
  thumbnail: string | null;
  category: string | null;
  publishedAt: string | null;
  communityUpdatedAt: string | null;
  slideCount: number;
  authorName: string | null;
  authorImage: string | null;
  updatedByName: string | null;
  communityStatus: CommunityReviewStatus;
  isOwner: boolean;
};

export type CommunityProjectMeta = {
  id: string;
  title: string;
  communityStatus: CommunityReviewStatus;
  category: string | null;
  publishedAt: string | null;
  communityUpdatedAt: string | null;
  isPublished: boolean;
};

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

function isAdminUser(user: { role: string; email: string }): boolean {
  return isPlatformAdmin(user.role) || emailIsAdmin(user.email);
}

async function requireUser() {
  const userId = await requireUserId();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
}

function orderByForSort(
  sort: CommunitySortId,
): Prisma.ProjectOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ publishedAt: "asc" }, { createdAt: "asc" }];
    case "alphabetical":
      return [{ title: "asc" }];
    case "updated":
      return [{ communityUpdatedAt: "desc" }, { updatedAt: "desc" }];
    case "newest":
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

export async function listCommunityProjects(options?: {
  search?: string;
  category?: string | "all";
  sort?: CommunitySortId;
  status?: CommunityReviewStatus | "all";
  mine?: boolean;
}): Promise<ActionResult<{ projects: CommunityProjectListItem[] }>> {
  try {
    const status = options?.status ?? "APPROVED";
    const search = options?.search?.trim();
    const sort = options?.sort ?? "newest";
    const category = options?.category?.trim();
    const user = await requireUser();
    const admin = user ? isAdminUser(user) : false;

    const where: Prisma.ProjectWhereInput = {
      isPublic: true,
      ...(options?.mine && user
        ? { userId: user.id }
        : status === "all" && admin
          ? {}
          : { communityStatus: status === "all" ? "APPROVED" : status }),
    };

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (category && category !== "all" && isCommunityCategory(category)) {
      where.communityCategory = category;
    }

    const rows = await prisma.project.findMany({
      where,
      orderBy: orderByForSort(sort),
      take: 180,
      select: {
        id: true,
        title: true,
        aspectRatio: true,
        thumbnail: true,
        communityCategory: true,
        publishedAt: true,
        communityUpdatedAt: true,
        communityStatus: true,
        userId: true,
        user: { select: { name: true, image: true } },
        communityUpdatedBy: { select: { name: true } },
        _count: { select: { slides: true } },
      },
    });

    return {
      success: true,
      projects: rows.map((row) => ({
        id: row.id,
        title: row.title,
        aspectRatio: row.aspectRatio,
        thumbnail: row.thumbnail,
        category: row.communityCategory,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        communityUpdatedAt: row.communityUpdatedAt?.toISOString() ?? null,
        slideCount: row._count.slides,
        authorName: row.user.name,
        authorImage: row.user.image,
        updatedByName: row.communityUpdatedBy?.name ?? row.user.name,
        communityStatus: row.communityStatus as CommunityReviewStatus,
        isOwner: Boolean(user && row.userId === user.id),
      })),
    };
  } catch (err) {
    console.error("listCommunityProjects error:", err);
    return { success: false, error: messages.errors.loadCommunity };
  }
}

export async function getProjectCommunityMeta(
  projectId: string,
): Promise<ActionResult<{ meta: CommunityProjectMeta }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) {
      return { success: false, error: messages.errors.projectIdRequired };
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        userId: true,
        organizationId: true,
        communityStatus: true,
        communityCategory: true,
        publishedAt: true,
        communityUpdatedAt: true,
        isPublic: true,
      },
    });
    if (!project || !(await canManageOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const isPublished =
      project.isPublic &&
      (project.communityStatus === "PENDING" ||
        project.communityStatus === "APPROVED");

    return {
      success: true,
      meta: {
        id: project.id,
        title: project.title,
        communityStatus: project.communityStatus as CommunityReviewStatus,
        category: project.communityCategory,
        publishedAt: project.publishedAt?.toISOString() ?? null,
        communityUpdatedAt: project.communityUpdatedAt?.toISOString() ?? null,
        isPublished,
      },
    };
  } catch (err) {
    console.error("getProjectCommunityMeta error:", err);
    return { success: false, error: messages.errors.loadCommunity };
  }
}

export async function publishProjectToCommunity(input: {
  projectId: string;
  category: string;
}): Promise<
  ActionResult<{ communityStatus: CommunityReviewStatus; republished: boolean }>
> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: messages.errors.signIn };
    const projectId = input.projectId?.trim();
    if (!projectId) {
      return { success: false, error: messages.errors.projectIdRequired };
    }
    if (!isCommunityCategory(input.category)) {
      return { success: false, error: "Pick a category" };
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        communityStatus: true,
        publishedAt: true,
        isPublic: true,
      },
    });
    if (!project || !(await canManageOrgResource(user.id, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const alreadyLive =
      project.isPublic &&
      (project.communityStatus === "PENDING" ||
        project.communityStatus === "APPROVED");

    const now = new Date();
    // First publish / rejected → review queue (admins auto-approve).
    // Republish of an approved listing stays approved and just refreshes content.
    const communityStatus: CommunityReviewStatus = isAdminUser(user)
      ? "APPROVED"
      : alreadyLive && project.communityStatus === "APPROVED"
        ? "APPROVED"
        : "PENDING";

    await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublic: true,
        communityCategory: input.category as CommunityCategory,
        communityStatus,
        publishedAt: project.publishedAt ?? now,
        communityUpdatedAt: now,
        communityUpdatedById: user.id,
      },
    });

    revalidatePath("/studio/browse");
    return { success: true, communityStatus, republished: alreadyLive };
  } catch (err) {
    console.error("publishProjectToCommunity error:", err);
    return { success: false, error: messages.errors.publishCommunity };
  }
}

export async function unpublishProject(
  projectId: string,
): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true },
    });
    if (!project || !(await canManageOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublic: false,
        publishedAt: null,
        communityUpdatedAt: null,
        communityUpdatedById: null,
        communityStatus: "DRAFT",
      },
    });

    revalidatePath("/studio/browse");
    return { success: true };
  } catch (err) {
    console.error("unpublishProject error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function setCommunityReviewStatus(
  projectId: string,
  status: Exclude<CommunityReviewStatus, "DRAFT">,
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user || !isAdminUser(user)) {
      return { success: false, error: messages.errors.unauthorized };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        communityStatus: status,
        ...(status === "APPROVED"
          ? { isPublic: true, publishedAt: new Date() }
          : {}),
        ...(status === "REJECTED" ? { isPublic: false } : {}),
      },
    });

    revalidatePath("/studio/browse");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("setCommunityReviewStatus error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export type CommunityPreview = {
  id: string;
  title: string;
  aspectRatio: string;
  category: string | null;
  slideCount: number;
  authorName: string | null;
  authorImage: string | null;
  updatedByName: string | null;
  publishedAt: string | null;
  communityUpdatedAt: string | null;
  isOwner: boolean;
  slides: Array<string | null>;
};

/** Public approved community project for the preview dialog. */
export async function getCommunityPreview(
  projectId: string,
): Promise<ActionResult<{ preview: CommunityPreview }>> {
  try {
    if (!projectId) {
      return { success: false, error: messages.errors.projectIdRequired };
    }

    const userId = await requireUserId();

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        isPublic: true,
        communityStatus: "APPROVED",
      },
      select: {
        id: true,
        title: true,
        aspectRatio: true,
        thumbnail: true,
        communityCategory: true,
        publishedAt: true,
        communityUpdatedAt: true,
        userId: true,
        user: { select: { name: true, image: true } },
        communityUpdatedBy: { select: { name: true } },
        slides: {
          orderBy: { order: "asc" },
          select: { thumbnail: true },
        },
      },
    });

    if (!project) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const slides =
      project.slides.length > 0
        ? project.slides.map((slide) => slide.thumbnail)
        : [project.thumbnail];

    return {
      success: true,
      preview: {
        id: project.id,
        title: project.title,
        aspectRatio: project.aspectRatio,
        category: project.communityCategory,
        slideCount: slides.length,
        authorName: project.user.name,
        authorImage: project.user.image,
        updatedByName: project.communityUpdatedBy?.name ?? project.user.name,
        publishedAt: project.publishedAt?.toISOString() ?? null,
        communityUpdatedAt: project.communityUpdatedAt?.toISOString() ?? null,
        isOwner: Boolean(userId && project.userId === userId),
        slides,
      },
    };
  } catch (err) {
    console.error("getCommunityPreview error:", err);
    return { success: false, error: messages.errors.loadCommunity };
  }
}

/** Clone a public approved community project into the caller's workspace. */
export async function cloneCommunityProject(
  projectId: string,
): Promise<ActionResult<{ projectId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        isPublic: true,
        communityStatus: "APPROVED",
      },
      include: { slides: { orderBy: { order: "asc" } } },
    });
    if (!project) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const org = await ensureUserOrganization();
    const organizationId = org.success
      ? org.organization.id
      : project.organizationId;

    const copy = await prisma.project.create({
      data: {
        title: `${project.title} copy`,
        aspectRatio: project.aspectRatio,
        width: project.width,
        height: project.height,
        canvasJSON: project.canvasJSON as Prisma.InputJsonValue,
        thumbnail: project.thumbnail,
        isPublic: false,
        communityStatus: "DRAFT",
        communityCategory: project.communityCategory,
        userId,
        organizationId,
        slides: {
          create: project.slides.map((slide) => ({
            order: slide.order,
            canvasJSON: slide.canvasJSON as Prisma.InputJsonValue,
            thumbnail: slide.thumbnail,
          })),
        },
      },
      select: { id: true },
    });

    revalidatePath("/");
    return { success: true, projectId: copy.id };
  } catch (err) {
    console.error("cloneCommunityProject error:", err);
    return { success: false, error: messages.errors.duplicateProject };
  }
}
