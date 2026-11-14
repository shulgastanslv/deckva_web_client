"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

import { ensureUserOrganization } from "@/actions/organizations";
import { prisma } from "@/lib/prisma";
import {
  canAccessOrgResource,
  canManageOrgResource,
} from "@/lib/studio/org-access";
import {
  CANVAS_RATIOS,
  type FabricCanvasJSON,
  type RatioKey,
  type SlideItem,
} from "@/lib/types";
import { normalizeDocument, type DocumentMeta } from "@/lib/canvas/document";

export interface ProjectListItem {
  id: string;
  title: string;
  aspectRatio: string;
  updatedAt: string;
  isSaved: boolean;
  slideCount: number;
  createdAt: string;
  /** First slide thumb — same as previewUrls[0] when present. */
  previewUrl: string | null;
  /** First 2–3 slide thumbnails for carousel stack peeks. */
  previewUrls: string[];
  authorName: string | null;
  authorImage: string | null;
  folderId: string | null;
  trashedAt: string | null;
}

export interface ProjectDetail {
  id: string;
  title: string;
  aspectRatio: RatioKey;
  width: number;
  height: number;
  isPublic: boolean;
  updatedAt: string;
  slides: SlideItem[];
  document: DocumentMeta;
}

export interface SaveProjectInput {
  title: string;
  aspectRatio: RatioKey;
  width: number;
  height: number;
  slides: Array<{
    canvasJSON: FabricCanvasJSON;
    thumbnail?: string | null;
  }>;
  document?: DocumentMeta;
}

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };


function isRatioKey(value: string): value is RatioKey {
  return value in CANVAS_RATIOS;
}

function toFabricJSON(value: unknown): FabricCanvasJSON {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const { snapshot: _document, ...rest } = record;
    return {
      version: typeof record.version === "string" ? record.version : "6.0.0",
      objects: Array.isArray(record.objects)
        ? (record.objects as Record<string, unknown>[])
        : [],
      ...rest,
    };
  }
  return { version: "6.0.0", objects: [], background: "#ffffff" };
}

function mapSlidesForClient(
  slides: Array<{ canvasJSON: unknown; thumbnail: string | null }>,
  projectThumbnail?: string | null,
): SlideItem[] {
  return slides.map((slide, index) => ({
    id: index + 1,
    canvasJSON: toFabricJSON(slide.canvasJSON),
    thumbnail: slide.thumbnail || (index === 0 ? projectThumbnail || null : null),
  }));
}

function emptyCanvasJSON(): FabricCanvasJSON {
  return { version: "6.0.0", objects: [], background: "#ffffff" };
}

/** Project.canvasJSON is required; keep it in sync with the first slide. */
function readStoredDocument(canvasJSON: unknown): DocumentMeta {
  if (!canvasJSON || typeof canvasJSON !== "object") return normalizeDocument(null);
  return normalizeDocument((canvasJSON as { snapshot?: unknown }).snapshot);
}

function projectSnapshot(
  slides: Array<{ canvasJSON: FabricCanvasJSON; thumbnail?: string | null }>,
  document?: DocumentMeta,
) {
  const first = slides[0];
  return {
    canvasJSON: {
      ...(first?.canvasJSON ?? emptyCanvasJSON()),
      snapshot: document ?? null,
    } as unknown as Prisma.InputJsonValue,
    thumbnail: first?.thumbnail ?? null,
  };
}

export async function getUserProjects(options?: {
  folderId?: string | null;
  /** When true, only trashed projects; otherwise active (non-trashed). */
  trashed?: boolean;
}): Promise<ActionResult<{ projects: ProjectListItem[] }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const org = await ensureUserOrganization();
    const organizationId = org.success ? org.organization.id : null;
    const inTrash = options?.trashed === true;

    // Shared workspace: every org member sees org projects, not only their own.
    const rawProjects = await prisma.project.findMany({
      where: {
        ...(organizationId
          ? { organizationId }
          : { userId }),
        ...(inTrash
          ? { trashedAt: { not: null } }
          : {
              trashedAt: null,
              ...(options?.folderId ? { folderId: options.folderId } : {}),
            }),
      },
      orderBy: inTrash ? { trashedAt: "desc" } : { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
        savedBy: { where: { userId }, select: { id: true } },
        _count: { select: { slides: true } },
        slides: {
          orderBy: { order: "asc" },
          take: 3,
          select: { thumbnail: true },
        },
      },
    });

    const projects: ProjectListItem[] = rawProjects.map((p) => {
      const fromSlides = p.slides
        .map((s) => s.thumbnail)
        .filter((url): url is string => Boolean(url));
      const previewUrls =
        fromSlides.length > 0
          ? fromSlides
          : p.thumbnail
            ? [p.thumbnail]
            : [];
      return {
        id: p.id,
        title: p.title,
        aspectRatio: p.aspectRatio,
        updatedAt: (p.trashedAt ?? p.updatedAt).toISOString(),
        isSaved: p.savedBy.length > 0,
        slideCount: p._count.slides,
        createdAt: p.createdAt.toISOString(),
        previewUrl: previewUrls[0] ?? null,
        previewUrls,
        authorName: p.user.name || p.user.email,
        authorImage: p.user.image,
        folderId: p.folderId,
        trashedAt: p.trashedAt?.toISOString() ?? null,
      };
    });

    return { success: true, projects };
  } catch (err) {
    console.error("getUserProjects error:", err);
    return { success: false, error: messages.errors.loadProjects };
  }
}

export async function createProject(input?: {
  title?: string;
  aspectRatio?: RatioKey;
  slidesCount?: number;
}): Promise<ActionResult<{ projectId: string; project: ProjectDetail }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const org = await ensureUserOrganization();
    if (!org.success) {
      return { success: false, error: messages.errors.ensureOrganization };
    }
    const organizationId = org.organization.id;

    const aspectRatio = input?.aspectRatio ?? "4:5";
    const dims = CANVAS_RATIOS[aspectRatio] ?? CANVAS_RATIOS["4:5"];
    const title = input?.title?.trim() || "Untitled Carousel";
    const slidesCount = Math.min(
      20,
      Math.max(1, Math.round(input?.slidesCount ?? 1)),
    );
    const blankSlides = Array.from({ length: slidesCount }, () => ({
      canvasJSON: emptyCanvasJSON(),
    }));

    const project = await prisma.project.create({
      data: {
        userId,
        organizationId,
        title,
        aspectRatio,
        width: dims.width,
        height: dims.height,
        ...projectSnapshot(blankSlides, normalizeDocument(null)),
        slides: {
          create: blankSlides.map((slide, order) => ({
            order,
            canvasJSON: slide.canvasJSON as unknown as Prisma.InputJsonValue,
          })),
        },
      },
      include: {
        slides: { orderBy: { order: "asc" } },
      },
    });

    revalidatePath("/");

    return {
      success: true,
      projectId: project.id,
      project: {
        id: project.id,
        title: project.title,
        aspectRatio: isRatioKey(project.aspectRatio) ? project.aspectRatio : "4:5",
        width: project.width,
        height: project.height,
        isPublic: project.isPublic,
        updatedAt: project.updatedAt.toISOString(),
        slides: mapSlidesForClient(project.slides),
        document: readStoredDocument(project.canvasJSON),
      },
    };
  } catch (err) {
    console.error("createProject error:", err);
    return { success: false, error: messages.errors.createProject };
  }
}

export async function getProjectById(
  projectId: string,
): Promise<ActionResult<{ project: ProjectDetail; isOwner: boolean }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };

    const project = await prisma.project.findFirst({
      where: { id: projectId, trashedAt: null },
      include: {
        slides: { orderBy: { order: "asc" } },
      },
    });

    if (!project || !(await canAccessOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    return {
      success: true,
      isOwner: project.userId === userId,
      project: {
        id: project.id,
        title: project.title,
        aspectRatio: isRatioKey(project.aspectRatio) ? project.aspectRatio : "4:5",
        width: project.width,
        height: project.height,
        isPublic: project.isPublic,
        updatedAt: project.updatedAt.toISOString(),
        slides: mapSlidesForClient(
          project.slides.length > 0
            ? project.slides
            : [{ canvasJSON: project.canvasJSON, thumbnail: project.thumbnail }],
          project.thumbnail,
        ),
        document: readStoredDocument(project.canvasJSON),
      },
    };
  } catch (err) {
    console.error("getProjectById error:", err);
    return { success: false, error: messages.errors.loadProject };
  }
}

/** Make a project publicly viewable via share link (owner only). */
export async function setProjectPublic(
  projectId: string,
  isPublic: boolean,
): Promise<ActionResult<{ isPublic: boolean; sharePath: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };

    const result = await prisma.project.updateMany({
      where: { id: projectId, userId },
      data: { isPublic },
    });

    if (result.count === 0) return { success: false, error: messages.errors.projectNotFound };

    return {
      success: true,
      isPublic,
      sharePath: `/view/${projectId}`,
    };
  } catch (err) {
    console.error("setProjectPublic error:", err);
    return { success: false, error: messages.errors.updateAccess };
  }
}

/** Public carousel for a share link. Only projects marked public. */
export async function getPublicCarousel(projectId: string): Promise<
  ActionResult<{
    title: string;
    aspectRatio: RatioKey;
    slides: Array<string | null>;
  }>
> {
  try {
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };

    const project = await prisma.project.findFirst({
      where: { id: projectId, isPublic: true },
      select: {
        title: true,
        aspectRatio: true,
        thumbnail: true,
        slides: {
          orderBy: { order: "asc" },
          select: { thumbnail: true },
        },
      },
    });

    if (!project) return { success: false, error: messages.errors.carouselNotPublic };

    const slides =
      project.slides.length > 0
        ? project.slides.map((slide) => slide.thumbnail)
        : [project.thumbnail];

    return {
      success: true,
      title: project.title,
      aspectRatio: isRatioKey(project.aspectRatio) ? project.aspectRatio : "4:5",
      slides,
    };
  } catch (err) {
    console.error("getPublicCarousel error:", err);
    return { success: false, error: messages.errors.loadCarousel };
  }
}

/** Persist project meta + full slide list (replace-all by order). */
export async function saveProject(
  projectId: string,
  input: SaveProjectInput,
): Promise<ActionResult<{ updatedAt: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };
    if (!input.slides?.length) {
      return { success: false, error: messages.errors.slideRequired };
    }

    const existing = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true },
    });
    if (
      !existing ||
      !(await canAccessOrgResource(userId, existing))
    ) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const dims =
      CANVAS_RATIOS[input.aspectRatio] ??
      ({ width: input.width, height: input.height } as const);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.slide.deleteMany({ where: { projectId } });

      await tx.slide.createMany({
        data: input.slides.map((slide, order) => ({
          projectId,
          order,
          canvasJSON: slide.canvasJSON as unknown as Prisma.InputJsonValue,
          thumbnail: slide.thumbnail ?? null,
        })),
      });

      return tx.project.update({
        where: { id: projectId },
        data: {
          title: input.title.trim() || "Untitled Carousel",
          aspectRatio: input.aspectRatio,
          width: dims.width,
          height: dims.height,
          ...projectSnapshot(input.slides, input.document),
        },
        select: { updatedAt: true },
      });
    }, { maxWait: 10_000, timeout: 30_000 });

    revalidatePath("/");
    return { success: true, updatedAt: updated.updatedAt.toISOString() };
  } catch (err) {
    console.error("saveProject error:", err);
    return { success: false, error: messages.errors.saveProject };
  }
}

/** Create a project from the current editor state (first save of an unsaved draft). */
export async function saveAsNewProject(
  input: SaveProjectInput,
): Promise<ActionResult<{ projectId: string; updatedAt: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!input.slides?.length) {
      return { success: false, error: messages.errors.slideRequired };
    }

    const dims =
      CANVAS_RATIOS[input.aspectRatio] ??
      ({ width: input.width, height: input.height } as const);

    const org = await ensureUserOrganization();
    const organizationId = org.success ? org.organization.id : null;

    const project = await prisma.project.create({
      data: {
        userId,
        organizationId,
        title: input.title.trim() || "Untitled Carousel",
        aspectRatio: input.aspectRatio,
        width: dims.width,
        height: dims.height,
        ...projectSnapshot(input.slides, input.document),
        slides: {
          create: input.slides.map((slide, order) => ({
            order,
            canvasJSON: slide.canvasJSON as unknown as Prisma.InputJsonValue,
            thumbnail: slide.thumbnail ?? null,
          })),
        },
      },
      select: { id: true, updatedAt: true },
    });

    revalidatePath("/");
    return {
      success: true,
      projectId: project.id,
      updatedAt: project.updatedAt.toISOString(),
    };
  } catch (err) {
    console.error("saveAsNewProject error:", err);
    return { success: false, error: messages.errors.saveProject };
  }
}

/** Patch slide/project previews without rewriting canvas JSON. */
export async function saveProjectThumbnails(
  projectId: string,
  thumbnails: Array<string | null>,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };
    if (!thumbnails.length) {
      return { success: false, error: messages.errors.slideRequired };
    }

    const access = await prisma.project.findFirst({
      where: { id: projectId },
      select: { userId: true, organizationId: true },
    });
    if (!access || !(await canAccessOrgResource(userId, access))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: {
        thumbnail: true,
        updatedAt: true,
        slides: {
          orderBy: { order: "asc" },
          select: { id: true, thumbnail: true },
        },
      },
    });
    if (!project) return { success: false, error: messages.errors.projectNotFound };
    if (project.slides.length !== thumbnails.length) {
      return { success: false, error: messages.errors.slideCountChanged };
    }

    const first = thumbnails[0] || null;
    const slideWrites = project.slides.flatMap((slide, index) => {
      const next = thumbnails[index] || null;
      if (next === (slide.thumbnail ?? null)) return [];
      return [{ id: slide.id, thumbnail: next }];
    });
    const projectThumbChanged = (project.thumbnail ?? null) !== first;
    if (slideWrites.length === 0 && !projectThumbChanged) {
      return { success: true, updated: false };
    }

    await prisma.$transaction(async (tx) => {
      for (const slide of slideWrites) {
        await tx.slide.update({
          where: { id: slide.id },
          data: { thumbnail: slide.thumbnail },
        });
      }
      if (projectThumbChanged) {
        await tx.project.update({
          where: { id: projectId },
          data: { thumbnail: first, updatedAt: project.updatedAt },
        });
      }
    }, { maxWait: 10_000, timeout: 30_000 });
    return { success: true, updated: true };
  } catch (err) {
    console.error("saveProjectThumbnails error:", err);
    return { success: false, error: messages.errors.saveThumbnails };
  }
}

export async function updateProjectTitle(
  projectId: string,
  title: string,
): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };

    const existing = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true },
    });
    if (!existing || !(await canAccessOrgResource(userId, existing))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { title: title.trim() || "Untitled Carousel" },
    });
    return { success: true };
  } catch {
    return { success: false, error: messages.errors.renameProject };
  }
}

export async function duplicateProject(
  projectId: string,
): Promise<ActionResult<{ projectId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      include: { slides: { orderBy: { order: "asc" } } },
    });
    if (!project || !(await canAccessOrgResource(userId, project))) {
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
    console.error("duplicateProject error:", err);
    return { success: false, error: messages.errors.duplicateProject };
  }
}

export async function toggleSaveProject(
  projectId: string,
): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!projectId) return { success: false, error: messages.errors.projectIdRequired };

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true, isPublic: true },
    });
    if (
      !project ||
      (!(await canAccessOrgResource(userId, project)) && !project.isPublic)
    ) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const existing = await prisma.savedProject.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (existing) {
      await prisma.savedProject.delete({ where: { id: existing.id } });
      return { success: true, saved: false };
    }

    await prisma.savedProject.create({ data: { userId, projectId } });
    return { success: true, saved: true };
  } catch (err) {
    console.error("toggleSaveProject error:", err);
    return { success: false, error: messages.errors.saveFailed };
  }
}

async function managedProjectIds(
  userId: string,
  projectIds: string[],
): Promise<string[]> {
  const unique = [...new Set(projectIds.filter(Boolean))];
  if (unique.length === 0) return [];
  const rows = await prisma.project.findMany({
    where: { id: { in: unique } },
    select: { id: true, userId: true, organizationId: true },
  });
  const allowed: string[] = [];
  for (const row of rows) {
    if (await canManageOrgResource(userId, row)) allowed.push(row.id);
  }
  return allowed;
}

/** Move project(s) to Trash (soft-delete). */
export async function deleteProject(projectId: string): Promise<ActionResult<object>> {
  return trashProjects([projectId]);
}

export async function trashProjects(
  projectIds: string[],
): Promise<ActionResult<{ count: number }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const ids = await managedProjectIds(userId, projectIds);
    if (ids.length === 0) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const result = await prisma.project.updateMany({
      where: { id: { in: ids }, trashedAt: null },
      data: { trashedAt: new Date() },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.errors.deleteProject };
  }
}

export async function restoreProjects(
  projectIds: string[],
): Promise<ActionResult<{ count: number }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const ids = await managedProjectIds(userId, projectIds);
    if (ids.length === 0) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const result = await prisma.project.updateMany({
      where: { id: { in: ids }, trashedAt: { not: null } },
      data: { trashedAt: null },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.errors.restoreProject };
  }
}

export async function permanentlyDeleteProjects(
  projectIds: string[],
): Promise<ActionResult<{ count: number }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const ids = await managedProjectIds(userId, projectIds);
    if (ids.length === 0) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const result = await prisma.project.deleteMany({
      where: { id: { in: ids }, trashedAt: { not: null } },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.errors.deleteProject };
  }
}

export async function emptyTrash(): Promise<ActionResult<{ count: number }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const org = await ensureUserOrganization();
    const organizationId = org.success ? org.organization.id : null;
    const trashed = await prisma.project.findMany({
      where: {
        trashedAt: { not: null },
        ...(organizationId ? { organizationId } : { userId }),
      },
      select: { id: true, userId: true, organizationId: true },
    });
    const ids: string[] = [];
    for (const row of trashed) {
      if (await canManageOrgResource(userId, row)) ids.push(row.id);
    }
    if (ids.length === 0) return { success: true, count: 0 };

    const result = await prisma.project.deleteMany({
      where: { id: { in: ids }, trashedAt: { not: null } },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.errors.deleteProject };
  }
}

/** Star or unstar many projects for the current user. */
export async function setProjectsStarred(
  projectIds: string[],
  starred: boolean,
): Promise<ActionResult<{ count: number }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    const unique = [...new Set(projectIds.filter(Boolean))];
    if (unique.length === 0) {
      return { success: false, error: messages.errors.projectIdRequired };
    }

    const accessible = await prisma.project.findMany({
      where: {
        id: { in: unique },
        trashedAt: null,
      },
      select: { id: true, userId: true, organizationId: true, isPublic: true },
    });
    const ids: string[] = [];
    for (const row of accessible) {
      if ((await canAccessOrgResource(userId, row)) || row.isPublic) {
        ids.push(row.id);
      }
    }
    if (ids.length === 0) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    if (starred) {
      await prisma.savedProject.createMany({
        data: ids.map((projectId) => ({ userId, projectId })),
        skipDuplicates: true,
      });
    } else {
      await prisma.savedProject.deleteMany({
        where: { userId, projectId: { in: ids } },
      });
    }
    revalidatePath("/");
    return { success: true, count: ids.length };
  } catch {
    return { success: false, error: messages.errors.saveFailed };
  }
}
