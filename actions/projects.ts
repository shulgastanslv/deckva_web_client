"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

import { ensureUserOrganization } from "@/actions/organizations";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { userHasPro } from "@/lib/billing/entitlements";
import { prisma } from "@/lib/prisma";
import {
  FREE_CAROUSEL_LIMIT,
  freeCarouselLimitMessage,
} from "@/lib/studio/plans";
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
  previewUrl: string | null;
  authorName: string | null;
  folderId: string | null;
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

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

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
}): Promise<ActionResult<{ projects: ProjectListItem[] }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const org = await ensureUserOrganization();
    const organizationId = org.success ? org.organization.id : null;

    const rawProjects = await prisma.project.findMany({
      where: {
        userId,
        ...(organizationId ? { organizationId } : {}),
        ...(options?.folderId ? { folderId: options.folderId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        savedBy: { where: { userId }, select: { id: true } },
        _count: { select: { slides: true } },
        slides: {
          orderBy: { order: "asc" },
          take: 1,
          select: { thumbnail: true },
        },
      },
    });

    const projects: ProjectListItem[] = rawProjects.map((p) => ({
      id: p.id,
      title: p.title,
      aspectRatio: p.aspectRatio,
      updatedAt: p.updatedAt.toISOString(),
      isSaved: p.savedBy.length > 0,
      slideCount: p._count.slides,
      createdAt: p.createdAt.toISOString(),
      previewUrl: p.slides[0]?.thumbnail || p.thumbnail || null,
      authorName: p.user.name || p.user.email,
      folderId: p.folderId,
    }));

    return { success: true, projects };
  } catch (err) {
    console.error("getUserProjects error:", err);
    return { success: false, error: "Couldn't load projects" };
  }
}

export async function createProject(input?: {
  title?: string;
  aspectRatio?: RatioKey;
}): Promise<ActionResult<{ projectId: string; project: ProjectDetail }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const org = await ensureUserOrganization();
    if (!org.success) {
      return { success: false, error: "Couldn't ensure organization" };
    }
    const organizationId = org.organization.id;

    if (!(await userHasPro(userId))) {
      const count = await prisma.project.count({
        where: { userId },
      });
      if (count >= FREE_CAROUSEL_LIMIT) {
        return {
          success: false,
          error: `Upgrade to Pro — ${freeCarouselLimitMessage()}`,
        };
      }
    }

    const aspectRatio = input?.aspectRatio ?? "4:5";
    const dims = CANVAS_RATIOS[aspectRatio] ?? CANVAS_RATIOS["4:5"];
    const title = input?.title?.trim() || "Untitled Carousel";

    const project = await prisma.project.create({
      data: {
        userId,
        organizationId,
        title,
        aspectRatio,
        width: dims.width,
        height: dims.height,
        ...projectSnapshot([{ canvasJSON: emptyCanvasJSON() }], normalizeDocument(null)),
        slides: {
          create: {
            order: 0,
            canvasJSON: emptyCanvasJSON() as unknown as Prisma.InputJsonValue,
          },
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
    return { success: false, error: "Couldn't create the project" };
  }
}

export async function getProjectById(
  projectId: string,
): Promise<ActionResult<{ project: ProjectDetail; isOwner: boolean }>> {
  try {
    const userId = await requireUserId();
    if (!projectId) return { success: false, error: "projectId is required" };

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          ...(userId ? [{ userId }] : []),
          { isPublic: true },
        ],
      },
      include: {
        slides: { orderBy: { order: "asc" } },
      },
    });

    if (!project) return { success: false, error: "Project not found" };

    return {
      success: true,
      isOwner: !!userId && project.userId === userId,
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
    return { success: false, error: "Couldn't load" };
  }
}

/** Make a project publicly viewable via share link (owner only). */
export async function setProjectPublic(
  projectId: string,
  isPublic: boolean,
): Promise<ActionResult<{ isPublic: boolean; sharePath: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    if (!projectId) return { success: false, error: "projectId is required" };

    const result = await prisma.project.updateMany({
      where: { id: projectId, userId },
      data: { isPublic },
    });

    if (result.count === 0) return { success: false, error: "Project not found" };

    return {
      success: true,
      isPublic,
      sharePath: `/view/${projectId}`,
    };
  } catch (err) {
    console.error("setProjectPublic error:", err);
    return { success: false, error: "Couldn't update access" };
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
    if (!projectId) return { success: false, error: "projectId is required" };

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

    if (!project) return { success: false, error: "This carousel is not public" };

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
    return { success: false, error: "Couldn't load the carousel" };
  }
}

/** Persist project meta + full slide list (replace-all by order). */
export async function saveProject(
  projectId: string,
  input: SaveProjectInput,
): Promise<ActionResult<{ updatedAt: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    if (!projectId) return { success: false, error: "projectId is required" };
    if (!input.slides?.length) {
      return { success: false, error: "At least one slide is required" };
    }

    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });
    if (!existing) return { success: false, error: "Project not found" };

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
    return { success: false, error: "Couldn't save the project" };
  }
}

/** Create a project from the current editor state (first save of an unsaved draft). */
export async function saveAsNewProject(
  input: SaveProjectInput,
): Promise<ActionResult<{ projectId: string; updatedAt: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    if (!input.slides?.length) {
      return { success: false, error: "At least one slide is required" };
    }

    const dims =
      CANVAS_RATIOS[input.aspectRatio] ??
      ({ width: input.width, height: input.height } as const);

    const project = await prisma.project.create({
      data: {
        userId,
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
    return { success: false, error: "Couldn't save the project" };
  }
}

/** Patch slide/project previews without rewriting canvas JSON. */
export async function saveProjectThumbnails(
  projectId: string,
  thumbnails: Array<string | null>,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    if (!projectId) return { success: false, error: "projectId is required" };
    if (!thumbnails.length) {
      return { success: false, error: "At least one slide is required" };
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: {
        thumbnail: true,
        updatedAt: true,
        slides: {
          orderBy: { order: "asc" },
          select: { id: true, thumbnail: true },
        },
      },
    });
    if (!project) return { success: false, error: "Project not found" };
    if (project.slides.length !== thumbnails.length) {
      return { success: false, error: "Slide count changed" };
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
    return { success: false, error: "Couldn't save thumbnails" };
  }
}

export async function updateProjectTitle(
  projectId: string,
  title: string,
): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    if (!projectId) return { success: false, error: "projectId is required" };

    const result = await prisma.project.updateMany({
      where: { id: projectId, userId },
      data: { title: title.trim() || "Untitled Carousel" },
    });

    if (result.count === 0) return { success: false, error: "Project not found" };
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't rename the project" };
  }
}

export async function duplicateProject(
  projectId: string,
): Promise<ActionResult<{ projectId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { slides: { orderBy: { order: "asc" } } },
    });
    if (!project) return { success: false, error: "Project not found" };

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
    return { success: false, error: "Couldn't duplicate the project" };
  }
}

export async function toggleSaveProject(
  projectId: string,
): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    if (!projectId) return { success: false, error: "projectId is required" };

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
    return { success: false, error: "Couldn't save" };
  }
}

export async function deleteProject(projectId: string): Promise<ActionResult<object>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: "Sign in" };
    if (!projectId) return { success: false, error: "projectId is required" };

    const result = await prisma.project.deleteMany({
      where: { id: projectId, userId },
    });

    if (result.count === 0) return { success: false, error: "Project not found" };
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't delete the project" };
  }
}
