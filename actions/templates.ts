"use server";

import { requireUserId } from "@/lib/auth/session";
import { messages } from "@/lib/messages";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

import { emailIsAdmin } from "@/lib/auth-role";
import { isPlatformAdmin } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { TemplateStatus } from "@/lib/domain/templates";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import {
  isRatioKey,
  parseImportedTemplate,
  parseTemplateCanvasJSON,
} from "@/lib/templates/parse";

export interface PublishTemplateInput {
  title: string;
  category: string;
  badge?: string;
  aspectRatio: RatioKey;
  canvasJSON: FabricCanvasJSON | { slides: FabricCanvasJSON[] };
  thumbnails?: Array<string | null>;
  previewUrl?: string | null;
}

export type TemplateReviewStatus = TemplateStatus;
export { TemplateStatus };

export interface TemplateListItem {
  id: string;
  title: string;
  category: string;
  badge: string | null;
  previewUrl: string | null;
  aspectRatio: string;
  slideCount: number;
  status: TemplateReviewStatus;
  createdAt: string;
  authorId: string | null;
  authorName: string | null;
}

export interface TemplateDetail {
  id: string;
  title: string;
  category: string;
  badge: string | null;
  previewUrl: string | null;
  aspectRatio: RatioKey;
  slides: FabricCanvasJSON[];
  thumbnails: Array<string | null>;
  createdAt: string;
}

type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

function containsPattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

interface TemplateListRow {
  id: string;
  title: string;
  category: string;
  badge: string | null;
  previewUrl: string | null;
  aspectRatio: string;
  slideCount: number;
  status: TemplateReviewStatus;
  createdAt: Date;
  authorId: string | null;
  authorName: string | null;
}

function asReviewStatus(value: string | null | undefined): TemplateReviewStatus {
  if (value === TemplateStatus.PENDING || value === TemplateStatus.REJECTED || value === TemplateStatus.APPROVED) {
    return value;
  }
  return TemplateStatus.APPROVED;
}

export async function getTemplates(options?: {
  category?: string;
  search?: string;
  mine?: boolean;
  /** Admin review queue — omit for public APPROVED-only catalogue */
  status?: TemplateReviewStatus | "all";
}): Promise<ActionResult<{ templates: TemplateListItem[] }>> {
  try {
    const search = options?.search?.trim();
    const category = options?.category?.trim();
    const filters: Prisma.Sql[] = [Prisma.sql`TRUE`];
    const userId = await requireUserId();
    const user = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, email: true },
        })
      : null;
    const admin = user ? isAdminUser(user) : false;

    if (options?.mine) {
      if (!userId) {
        return { success: true, templates: [] };
      }
      filters.push(Prisma.sql`t."authorId" = ${userId}`);
    } else if (options?.status && options.status !== "all") {
      if (!admin) {
        return { success: false, error: messages.errors.adminOnly };
      }
      filters.push(Prisma.sql`t.status = ${options.status}::"TemplateStatus"`);
    } else if (options?.status === "all") {
      if (!admin) {
        return { success: false, error: messages.errors.adminOnly };
      }
    } else {
      // Public catalogue: approved only (authors still see own via mine)
      filters.push(Prisma.sql`t.status = 'APPROVED'::"TemplateStatus"`);
    }

    if (category && category !== "all") {
      filters.push(Prisma.sql`category = ${category}`);
    }
    if (search) {
      const pattern = containsPattern(search);
      filters.push(Prisma.sql`(
        title ILIKE ${pattern} ESCAPE '\\'
        OR COALESCE(badge, '') ILIKE ${pattern} ESCAPE '\\'
        OR category ILIKE ${pattern} ESCAPE '\\'
      )`);
    }

    const rows = await prisma.$queryRaw<TemplateListRow[]>`
      SELECT
        t.id,
        t.title,
        t.category,
        t.badge,
        t."previewUrl",
        t."aspectRatio",
        t.status::text AS status,
        t."createdAt",
        t."authorId",
        u.name AS "authorName",
        CASE
          WHEN jsonb_typeof(t."canvasJSON"->'slides') = 'array'
            THEN GREATEST(jsonb_array_length(t."canvasJSON"->'slides'), 1)
          ELSE 1
        END::int AS "slideCount"
      FROM "Template" t
      LEFT JOIN "User" u ON u.id = t."authorId"
      WHERE ${Prisma.join(filters, " AND ")}
      ORDER BY t."createdAt" DESC
    `;

    return {
      success: true,
      templates: rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        badge: row.badge,
        previewUrl: row.previewUrl,
        aspectRatio: row.aspectRatio,
        slideCount: Number(row.slideCount) || 1,
        status: asReviewStatus(row.status),
        createdAt: new Date(row.createdAt).toISOString(),
        authorId: row.authorId,
        authorName: row.authorName,
      })),
    };
  } catch (err) {
    console.error("getTemplates error:", err);
    return { success: false, error: messages.errors.loadTemplates };
  }
}

export async function getTemplateById(
  templateId: string,
): Promise<ActionResult<{ template: TemplateDetail }>> {
  try {
    if (!templateId) return { success: false, error: messages.errors.templateIdRequired };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!row) return { success: false, error: messages.errors.templateNotFound };

    const parsed = parseTemplateCanvasJSON(row.canvasJSON);
    const aspectRatio = isRatioKey(row.aspectRatio)
      ? row.aspectRatio
      : parsed.aspectRatio ?? "4:5";

    return {
      success: true,
      template: {
        id: row.id,
        title: row.title,
        category: row.category,
        badge: row.badge,
        previewUrl: row.previewUrl,
        aspectRatio,
        slides: parsed.slides,
        thumbnails: parsed.thumbnails,
        createdAt: row.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("getTemplateById error:", err);
    return { success: false, error: messages.errors.loadTemplate };
  }
}

export async function publishTemplate(
  input: PublishTemplateInput,
): Promise<ActionResult<{ templateId: string }>> {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return { success: false, error: messages.errors.signInToPublish };
    }

    const title = input.title.trim();
    const category = input.category.trim() || "Other";
    if (!title) return { success: false, error: messages.errors.templateName };

    const slides = Array.isArray((input.canvasJSON as { slides?: unknown }).slides)
      ? (input.canvasJSON as { slides: FabricCanvasJSON[] }).slides
      : [input.canvasJSON as FabricCanvasJSON];
    const thumbnails = slides.map((_, index) => input.thumbnails?.[index] || null);

    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });
    const status = author && isAdminUser(author) ? TemplateStatus.APPROVED : TemplateStatus.PENDING;

    const template = await prisma.template.create({
      data: {
        title,
        category,
        badge: input.badge?.trim() || null,
        aspectRatio: input.aspectRatio,
        previewUrl: input.previewUrl ?? null,
        status,
        canvasJSON: {
          slides,
          thumbnails,
          aspectRatio: input.aspectRatio,
        } as unknown as Prisma.InputJsonValue,
        authorId: userId,
      },
      select: { id: true },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, templateId: template.id };
  } catch (err) {
    console.error("publishTemplate error:", err);
    return { success: false, error: messages.errors.publishTemplate };
  }
}

export async function setTemplateReviewStatus(
  templateId: string,
  status: TemplateReviewStatus,
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user || !isAdminUser(user)) {
      return { success: false, error: messages.errors.adminOnly };
    }
    if (!templateId) {
      return { success: false, error: messages.errors.templateIdRequired };
    }

    const row = await prisma.template.findUnique({
      where: { id: templateId },
      select: { id: true },
    });
    if (!row) return { success: false, error: messages.errors.templateNotFound };

    await prisma.template.update({
      where: { id: templateId },
      data: { status },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/studio/templates");
    return { success: true };
  } catch (err) {
    console.error("setTemplateReviewStatus error:", err);
    return { success: false, error: messages.errors.updateTemplate };
  }
}


async function requireUser() {
  const userId = await requireUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
  return user;
}

function isAdminUser(user: { role: string; email: string }): boolean {
  return isPlatformAdmin(user.role) || emailIsAdmin(user.email);
}

export async function renameTemplate(
  templateId: string,
  title: string,
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: messages.errors.signIn };
    const next = title.trim();
    if (!next) return { success: false, error: messages.errors.enterName };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
      select: { authorId: true, category: true },
    });
    if (!row) return { success: false, error: messages.errors.templateNotFound };
    const owns = row.authorId === user.id;
    const admin = isAdminUser(user);
    if (!owns && !admin) return { success: false, error: messages.errors.renameTemplateForbidden };

    await prisma.template.update({ where: { id: templateId }, data: { title: next } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("renameTemplate error:", err);
    return { success: false, error: messages.errors.renameTemplate };
  }
}

export async function duplicateTemplate(
  templateId: string,
): Promise<ActionResult<{ templateId: string }>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: messages.errors.signIn };
    const row = await prisma.template.findUnique({ where: { id: templateId } });
    if (!row) return { success: false, error: messages.errors.templateNotFound };

    const copy = await prisma.template.create({
      data: {
        title: `${row.title} copy`,
        category: row.category,
        badge: row.badge,
        previewUrl: row.previewUrl,
        aspectRatio: row.aspectRatio,
        status: isAdminUser(user) ? TemplateStatus.APPROVED : TemplateStatus.PENDING,
        canvasJSON: row.canvasJSON as Prisma.InputJsonValue,
        authorId: user.id,
      },
      select: { id: true },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, templateId: copy.id };
  } catch (err) {
    console.error("duplicateTemplate error:", err);
    return { success: false, error: messages.errors.duplicateTemplate };
  }
}

export async function updateTemplateMeta(
  templateId: string,
  input: { title?: string; category?: string; badge?: string | null },
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: messages.errors.signIn };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
      select: { authorId: true },
    });
    if (!row) return { success: false, error: messages.errors.templateNotFound };

    const owns = row.authorId === user.id;
    if (!owns && !isAdminUser(user)) {
      return { success: false, error: messages.errors.editTemplateForbidden };
    }

    const data: { title?: string; category?: string; badge?: string | null } = {};
    if (typeof input.title === "string") {
      const title = input.title.trim();
      if (!title) return { success: false, error: messages.errors.enterName };
      data.title = title;
    }
    if (typeof input.category === "string") {
      const category = input.category.trim();
      if (!category) return { success: false, error: messages.errors.enterCategory };
      data.category = category;
    }
    if (input.badge !== undefined) {
      data.badge = input.badge?.trim() || null;
    }
    if (Object.keys(data).length === 0) {
      return { success: false, error: messages.errors.nothingToUpdate };
    }

    await prisma.template.update({ where: { id: templateId }, data });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("updateTemplateMeta error:", err);
    return { success: false, error: messages.errors.updateTemplate };
  }
}

export async function deleteTemplate(
  templateId: string,
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: messages.errors.signIn };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
      select: { id: true, authorId: true },
    });
    if (!row) return { success: false, error: messages.errors.templateNotFound };

    const owns = row.authorId === user.id;
    if (!owns && !isAdminUser(user)) {
      return { success: false, error: messages.errors.deleteTemplateForbidden };
    }

    await prisma.template.delete({ where: { id: templateId } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("deleteTemplate error:", err);
    return { success: false, error: messages.errors.deleteTemplate };
  }
}

export async function importTemplateJson(input: {
  json: unknown;
  title?: string;
  category?: string;
  badge?: string | null;
}): Promise<ActionResult<{ templateId: string }>> {
  try {
    const user = await requireUser();
    if (!user || !isAdminUser(user)) {
      return { success: false, error: messages.errors.adminOnly };
    }

    const parsed = parseImportedTemplate(input.json);
    if (!parsed.ok) return { success: false, error: messages.errors.invalidTemplate };

    const record =
      input.json && typeof input.json === "object" && !Array.isArray(input.json)
        ? (input.json as Record<string, unknown>)
        : {};
    const fromFile = typeof record.category === "string" ? record.category.trim() : "";
    const title = (input.title?.trim() || parsed.template.title || "Imported template").trim();
    const category = input.category?.trim() || fromFile;
    if (!category) return { success: false, error: messages.errors.enterCategory };

    const aspectRatio = parsed.template.aspectRatio ?? "4:5";
    const created = await prisma.template.create({
      data: {
        title,
        category,
        badge: input.badge?.trim() || null,
        aspectRatio,
        status: TemplateStatus.APPROVED,
        previewUrl: parsed.template.previewUrl ?? parsed.template.thumbnails[0] ?? null,
        canvasJSON: {
          slides: parsed.template.slides,
          thumbnails: parsed.template.thumbnails,
          aspectRatio,
        } as unknown as Prisma.InputJsonValue,
        authorId: user.id,
      },
      select: { id: true },
    });

    revalidatePath("/");
    revalidatePath("/studio/templates");
    revalidatePath("/admin");
    return { success: true, templateId: created.id };
  } catch (err) {
    console.error("importTemplateJson error:", err);
    return { success: false, error: messages.errors.importTemplate };
  }
}
