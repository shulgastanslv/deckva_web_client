"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

import { ensureUserOrganization } from "@/actions/organizations";
import { prisma } from "@/lib/prisma";
import { canAccessOrgResource } from "@/lib/studio/org-access";

import {
  ArtifactKind,
  ArtifactStatus,
  type ArtifactKind as ArtifactKindValue,
  type ArtifactStatus as ArtifactStatusValue,
} from "@/lib/domain/artifacts";

export type { ArtifactKindValue, ArtifactStatusValue };
export { ArtifactKind, ArtifactStatus };

export type TextArtifactPayload = {
  text: string;
};

export type PaletteArtifactPayload = {
  name: string;
  bg: string;
  text: string;
  muted: string;
  accent: string;
  accent_text: string;
  grid: string;
  photo: string;
};

export type CarouselArtifactPayload = {
  topic?: string;
};

export type ArtifactListItem = {
  id: string;
  kind: ArtifactKindValue;
  title: string;
  prompt: string | null;
  status: ArtifactStatusValue;
  updatedAt: string;
  createdAt: string;
  previewText: string | null;
  previewColors: string[] | null;
  projectId: string | null;
  parentId: string | null;
  folderId: string | null;
};

export type ArtifactDetail = {
  id: string;
  kind: ArtifactKindValue;
  title: string;
  prompt: string | null;
  status: ArtifactStatusValue;
  payload: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
  projectId: string | null;
  parentId: string | null;
  folderId: string | null;
};

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };


function asPayloadRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function previewFromPayload(kind: ArtifactKindValue, payload: unknown): string | null {
  const row = asPayloadRecord(payload);
  if (kind === ArtifactKind.TEXT && typeof row.text === "string") {
    const text = row.text.trim();
    if (!text) return null;
    return text.length <= 140 ? text : `${text.slice(0, 137).trimEnd()}…`;
  }
  if (kind === ArtifactKind.PALETTE) {
    const name = typeof row.name === "string" ? row.name.trim() : "";
    return name || null;
  }
  if (typeof row.topic === "string" && row.topic.trim()) {
    return row.topic.trim().slice(0, 140);
  }
  return null;
}

function previewColorsFromPayload(
  kind: ArtifactKindValue,
  payload: unknown,
): string[] | null {
  if (kind !== ArtifactKind.PALETTE) return null;
  const row = asPayloadRecord(payload);
  const colors = [row.bg, row.accent, row.text, row.photo, row.muted]
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    .map((c) => c.trim());
  return colors.length > 0 ? colors : null;
}

function mapListItem(row: {
  id: string;
  kind: ArtifactKindValue;
  title: string;
  prompt: string | null;
  status: ArtifactStatusValue;
  payload: unknown;
  updatedAt: Date;
  createdAt: Date;
  projectId: string | null;
  parentId: string | null;
  folderId: string | null;
}): ArtifactListItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    prompt: row.prompt,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    previewText: previewFromPayload(row.kind, row.payload),
    previewColors: previewColorsFromPayload(row.kind, row.payload),
    projectId: row.projectId,
    parentId: row.parentId,
    folderId: row.folderId,
  };
}

export async function getUserArtifacts(options?: {
  kind?: ArtifactKindValue;
  folderId?: string | null;
}): Promise<ActionResult<{ artifacts: ArtifactListItem[] }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const org = await ensureUserOrganization();
    const organizationId = org.success ? org.organization.id : null;

    const artifacts = await prisma.artifact.findMany({
      where: {
        ...(organizationId ? { organizationId } : { userId }),
        ...(options?.kind ? { kind: options.kind } : {}),
        ...(options?.folderId ? { folderId: options.folderId } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      artifacts: artifacts.map((a) =>
        mapListItem({
          ...a,
          kind: a.kind as ArtifactKindValue,
          status: a.status as ArtifactStatusValue,
        }),
      ),
    };
  } catch (err) {
    console.error("getUserArtifacts error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function getArtifactById(
  artifactId: string,
): Promise<ActionResult<{ artifact: ArtifactDetail }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };
    if (!artifactId) return { success: false, error: messages.errors.generic };

    const artifact = await prisma.artifact.findFirst({
      where: { id: artifactId },
    });
    if (!artifact || !(await canAccessOrgResource(userId, artifact))) {
      return { success: false, error: messages.errors.generic };
    }

    return {
      success: true,
      artifact: {
        id: artifact.id,
        kind: artifact.kind as ArtifactKindValue,
        title: artifact.title,
        prompt: artifact.prompt,
        status: artifact.status as ArtifactStatusValue,
        payload: asPayloadRecord(artifact.payload),
        updatedAt: artifact.updatedAt.toISOString(),
        createdAt: artifact.createdAt.toISOString(),
        projectId: artifact.projectId,
        parentId: artifact.parentId,
        folderId: artifact.folderId,
      },
    };
  } catch (err) {
    console.error("getArtifactById error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function createPaletteArtifact(input: {
  prompt: string;
  palette: PaletteArtifactPayload;
  title?: string;
  parentId?: string | null;
}): Promise<ActionResult<{ artifactId: string; artifact: ArtifactDetail }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const org = await ensureUserOrganization();
    if (!org.success) {
      return { success: false, error: messages.errors.ensureOrganization };
    }

    const prompt = input.prompt.trim();
    if (prompt.length < 2) {
      return { success: false, error: messages.errors.generic };
    }

    const payload: PaletteArtifactPayload = input.palette;
    const title =
      input.title?.trim() ||
      payload.name ||
      (prompt.length <= 64 ? prompt : `${prompt.slice(0, 61).trimEnd()}…`);

    const artifact = await prisma.artifact.create({
      data: {
        kind: ArtifactKind.PALETTE,
        title,
        prompt,
        payload: payload as unknown as Prisma.InputJsonValue,
        status: ArtifactStatus.READY,
        userId,
        organizationId: org.organization.id,
        parentId: input.parentId || null,
        projectId: null,
      },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return {
      success: true,
      artifactId: artifact.id,
      artifact: {
        id: artifact.id,
        kind: ArtifactKind.PALETTE,
        title: artifact.title,
        prompt: artifact.prompt,
        status: ArtifactStatus.READY,
        payload: payload as unknown as Record<string, unknown>,
        updatedAt: artifact.updatedAt.toISOString(),
        createdAt: artifact.createdAt.toISOString(),
        projectId: null,
        parentId: artifact.parentId,
        folderId: artifact.folderId,
      },
    };
  } catch (err) {
    console.error("createPaletteArtifact error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function createTextArtifact(input: {
  prompt: string;
  text: string;
  title?: string;
  parentId?: string | null;
  projectId?: string | null;
}): Promise<ActionResult<{ artifactId: string; artifact: ArtifactDetail }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const org = await ensureUserOrganization();
    if (!org.success) {
      return { success: false, error: messages.errors.ensureOrganization };
    }

    const prompt = input.prompt.trim();
    const text = input.text.trim();
    if (prompt.length < 2 || text.length < 1) {
      return { success: false, error: messages.errors.generic };
    }

    const title =
      input.title?.trim() ||
      (prompt.length <= 64 ? prompt : `${prompt.slice(0, 61).trimEnd()}…`);

    const payload: TextArtifactPayload = { text };

    const artifact = await prisma.artifact.create({
      data: {
        kind: ArtifactKind.TEXT,
        title,
        prompt,
        payload: payload as unknown as Prisma.InputJsonValue,
        status: ArtifactStatus.READY,
        userId,
        organizationId: org.organization.id,
        parentId: input.parentId || null,
        // TEXT artifacts are not the carousel link; projectId reserved for CAROUSEL.
        projectId: null,
      },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/browse");

    return {
      success: true,
      artifactId: artifact.id,
      artifact: {
        id: artifact.id,
        kind: ArtifactKind.TEXT,
        title: artifact.title,
        prompt: artifact.prompt,
        status: ArtifactStatus.READY,
        payload: payload as unknown as Record<string, unknown>,
        updatedAt: artifact.updatedAt.toISOString(),
        createdAt: artifact.createdAt.toISOString(),
        projectId: null,
        parentId: artifact.parentId,
        folderId: artifact.folderId,
      },
    };
  } catch (err) {
    console.error("createTextArtifact error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function updateTextArtifact(
  artifactId: string,
  input: { title?: string; text?: string; prompt?: string },
): Promise<ActionResult<{ artifact: ArtifactDetail }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const existing = await prisma.artifact.findFirst({
      where: { id: artifactId, userId, kind: ArtifactKind.TEXT },
    });
    if (!existing) return { success: false, error: messages.errors.generic };

    const prev = asPayloadRecord(existing.payload);
    const nextText =
      typeof input.text === "string" ? input.text.trim() : String(prev.text ?? "");
    const payload: TextArtifactPayload = { text: nextText };

    const artifact = await prisma.artifact.update({
      where: { id: artifactId },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() || existing.title } : {}),
        ...(input.prompt !== undefined ? { prompt: input.prompt.trim() } : {}),
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/studio");
    revalidatePath(`/studio/artifacts/${artifactId}`);

    return {
      success: true,
      artifact: {
        id: artifact.id,
        kind: ArtifactKind.TEXT,
        title: artifact.title,
        prompt: artifact.prompt,
        status: artifact.status as ArtifactStatusValue,
        payload: payload as unknown as Record<string, unknown>,
        updatedAt: artifact.updatedAt.toISOString(),
        createdAt: artifact.createdAt.toISOString(),
        projectId: artifact.projectId,
        parentId: artifact.parentId,
        folderId: artifact.folderId,
      },
    };
  } catch (err) {
    console.error("updateTextArtifact error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function linkCarouselArtifact(input: {
  projectId: string;
  title: string;
  prompt?: string;
  parentId?: string | null;
  topic?: string;
}): Promise<ActionResult<{ artifactId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const org = await ensureUserOrganization();
    if (!org.success) {
      return { success: false, error: messages.errors.ensureOrganization };
    }

    const project = await prisma.project.findFirst({
      where: { id: input.projectId },
      select: { id: true, folderId: true, userId: true, organizationId: true },
    });
    if (!project || !(await canAccessOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const existing = await prisma.artifact.findFirst({
      where: { projectId: input.projectId },
      select: { id: true },
    });
    if (existing) {
      await prisma.artifact.update({
        where: { id: existing.id },
        data: {
          title: input.title.trim() || "Untitled Carousel",
          prompt: input.prompt?.trim() || null,
          parentId: input.parentId || undefined,
          payload: {
            topic: input.topic?.trim() || input.prompt?.trim() || "",
          } as unknown as Prisma.InputJsonValue,
          status: ArtifactStatus.READY,
        },
      });
      return { success: true, artifactId: existing.id };
    }

    const artifact = await prisma.artifact.create({
      data: {
        kind: ArtifactKind.CAROUSEL,
        title: input.title.trim() || "Untitled Carousel",
        prompt: input.prompt?.trim() || null,
        payload: {
          topic: input.topic?.trim() || input.prompt?.trim() || "",
        } as unknown as Prisma.InputJsonValue,
        status: ArtifactStatus.READY,
        userId,
        organizationId: org.organization.id,
        projectId: input.projectId,
        parentId: input.parentId || null,
        folderId: project.folderId,
      },
    });

    revalidatePath("/studio");
    return { success: true, artifactId: artifact.id };
  } catch (err) {
    console.error("linkCarouselArtifact error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function deleteArtifact(
  artifactId: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const result = await prisma.artifact.deleteMany({
      where: {
        id: artifactId,
        userId,
        kind: { in: [ArtifactKind.TEXT, ArtifactKind.PALETTE] },
      },
    });
    if (result.count === 0) {
      return { success: false, error: messages.errors.generic };
    }

    revalidatePath("/studio");
    revalidatePath("/studio/browse");
    return { success: true, deleted: true };
  } catch (err) {
    console.error("deleteArtifact error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export type ProjectAnnotationItem = {
  id: string;
  slideIndex: number;
  x: number | null;
  y: number | null;
  body: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listProjectAnnotations(
  projectId: string,
): Promise<ActionResult<{ annotations: ProjectAnnotationItem[] }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true },
    });
    if (!project || !(await canAccessOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const annotations = await prisma.projectAnnotation.findMany({
      where: { projectId },
      orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      annotations: annotations.map((a) => ({
        id: a.id,
        slideIndex: a.slideIndex,
        x: a.x,
        y: a.y,
        body: a.body,
        resolved: a.resolved,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("listProjectAnnotations error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function createProjectAnnotation(input: {
  projectId: string;
  slideIndex: number;
  body: string;
  x?: number | null;
  y?: number | null;
}): Promise<ActionResult<{ annotation: ProjectAnnotationItem }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const body = input.body.trim();
    if (!body) return { success: false, error: messages.errors.generic };

    const project = await prisma.project.findFirst({
      where: { id: input.projectId },
      select: { id: true, userId: true, organizationId: true },
    });
    if (!project || !(await canAccessOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    const annotation = await prisma.projectAnnotation.create({
      data: {
        projectId: input.projectId,
        slideIndex: Math.max(0, input.slideIndex),
        body,
        x: input.x ?? null,
        y: input.y ?? null,
      },
    });

    return {
      success: true,
      annotation: {
        id: annotation.id,
        slideIndex: annotation.slideIndex,
        x: annotation.x,
        y: annotation.y,
        body: annotation.body,
        resolved: annotation.resolved,
        createdAt: annotation.createdAt.toISOString(),
        updatedAt: annotation.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("createProjectAnnotation error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function updateProjectAnnotation(
  annotationId: string,
  input: { body?: string; resolved?: boolean },
): Promise<ActionResult<{ annotation: ProjectAnnotationItem }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const existing = await prisma.projectAnnotation.findFirst({
      where: { id: annotationId },
      include: {
        project: { select: { userId: true, organizationId: true } },
      },
    });
    if (
      !existing ||
      !(await canAccessOrgResource(userId, existing.project))
    ) {
      return { success: false, error: messages.errors.generic };
    }

    const annotation = await prisma.projectAnnotation.update({
      where: { id: annotationId },
      data: {
        ...(input.body !== undefined ? { body: input.body.trim() } : {}),
        ...(input.resolved !== undefined ? { resolved: input.resolved } : {}),
      },
    });

    return {
      success: true,
      annotation: {
        id: annotation.id,
        slideIndex: annotation.slideIndex,
        x: annotation.x,
        y: annotation.y,
        body: annotation.body,
        resolved: annotation.resolved,
        createdAt: annotation.createdAt.toISOString(),
        updatedAt: annotation.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("updateProjectAnnotation error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function deleteProjectAnnotation(
  annotationId: string,
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const existing = await prisma.projectAnnotation.findFirst({
      where: { id: annotationId },
      include: {
        project: { select: { userId: true, organizationId: true } },
      },
    });
    if (
      !existing ||
      !(await canAccessOrgResource(userId, existing.project))
    ) {
      return { success: false, error: messages.errors.generic };
    }

    await prisma.projectAnnotation.delete({ where: { id: annotationId } });
    return { success: true, deleted: true };
  } catch (err) {
    console.error("deleteProjectAnnotation error:", err);
    return { success: false, error: messages.errors.generic };
  }
}

export async function updateProjectCaption(
  projectId: string,
  postCaption: string | null,
): Promise<ActionResult<{ postCaption: string | null }>> {
  try {
    const userId = await requireUserId();
    if (!userId) return { success: false, error: messages.errors.signIn };

    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true },
    });
    if (!project || !(await canAccessOrgResource(userId, project))) {
      return { success: false, error: messages.errors.projectNotFound };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { postCaption: postCaption?.trim() || null },
    });

    return { success: true, postCaption: postCaption?.trim() || null };
  } catch (err) {
    console.error("updateProjectCaption error:", err);
    return { success: false, error: messages.errors.generic };
  }
}
