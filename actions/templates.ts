"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { emailIsAdmin } from "@/lib/auth-role";
import { prisma } from "@/lib/prisma";
import type { FabricCanvasJSON, RatioKey } from "@/lib/types";
import {
  isRatioKey,
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

export interface TemplateListItem {
  id: string;
  title: string;
  category: string;
  badge: string | null;
  previewUrl: string | null;
  aspectRatio: string;
  slideCount: number;
  createdAt: string;
  builtin: boolean;
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
  createdAt: Date;
  authorId: string | null;
  authorName: string | null;
}

export async function getTemplates(options?: {
  category?: string;
  search?: string;
  mine?: boolean;
}): Promise<ActionResult<{ templates: TemplateListItem[] }>> {
  try {
    const search = options?.search?.trim();
    const category = options?.category?.trim();
    const filters: Prisma.Sql[] = [Prisma.sql`TRUE`];

    if (options?.mine) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return { success: true, templates: [] };
      }
      filters.push(Prisma.sql`t."authorId" = ${session.user.id}`);
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

    const templates: TemplateListItem[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      badge: row.badge,
      previewUrl: row.previewUrl,
      aspectRatio: row.aspectRatio,
      slideCount: Number(row.slideCount) || 1,
      createdAt: new Date(row.createdAt).toISOString(),
      builtin: row.category === "Built-in",
      authorId: row.authorId,
      authorName: row.authorName,
    }));

    return { success: true, templates };
  } catch (err) {
    console.error("getTemplates error:", err);
    return { success: false, error: "Couldn't load templates" };
  }
}

export async function getTemplateById(
  templateId: string,
): Promise<ActionResult<{ template: TemplateDetail }>> {
  try {
    if (!templateId) return { success: false, error: "templateId is required" };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!row) return { success: false, error: "Template not found" };

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
    return { success: false, error: "Couldn't load the template" };
  }
}

export async function publishTemplate(
  input: PublishTemplateInput,
): Promise<ActionResult<{ templateId: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Sign in to publish" };
    }

    const title = input.title.trim();
    const category = input.category.trim() || "Other";
    if (!title) return { success: false, error: "Enter a template name" };

    const slides = Array.isArray((input.canvasJSON as { slides?: unknown }).slides)
      ? (input.canvasJSON as { slides: FabricCanvasJSON[] }).slides
      : [input.canvasJSON as FabricCanvasJSON];
    const thumbnails = slides.map((_, index) => input.thumbnails?.[index] || null);

    const template = await prisma.template.create({
      data: {
        title,
        category,
        badge: input.badge?.trim() || null,
        aspectRatio: input.aspectRatio,
        previewUrl: input.previewUrl ?? null,
        canvasJSON: {
          slides,
          thumbnails,
          aspectRatio: input.aspectRatio,
        } as unknown as Prisma.InputJsonValue,
        authorId: session.user.id,
      },
      select: { id: true },
    });

    revalidatePath("/");
    return { success: true, templateId: template.id };
  } catch (err) {
    console.error("publishTemplate error:", err);
    return { success: false, error: "Couldn't publish the template" };
  }
}


export async function getTemplateCategories(): Promise<
  ActionResult<{ categories: string[] }>
> {
  try {
    const rows = await prisma.template.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    return {
      success: true,
      categories: rows.map((r) => r.category),
    };
  } catch (err) {
    console.error("getTemplateCategories error:", err);
    return { success: false, error: "Couldn't load categories" };
  }
}

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true },
  });
  return user;
}

function isAdminUser(user: { role: string; email: string }): boolean {
  return user.role === "ADMIN" || emailIsAdmin(user.email);
}

export async function renameTemplate(
  templateId: string,
  title: string,
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: "Sign in" };
    const next = title.trim();
    if (!next) return { success: false, error: "Enter a name" };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
      select: { authorId: true, category: true },
    });
    if (!row) return { success: false, error: "Template not found" };
    const owns = row.authorId === user.id;
    const admin = isAdminUser(user);
    if (!owns && !admin) return { success: false, error: "You can't rename this template" };

    await prisma.template.update({ where: { id: templateId }, data: { title: next } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("renameTemplate error:", err);
    return { success: false, error: "Couldn't rename the template" };
  }
}

export async function duplicateTemplate(
  templateId: string,
): Promise<ActionResult<{ templateId: string }>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: "Sign in" };
    const row = await prisma.template.findUnique({ where: { id: templateId } });
    if (!row) return { success: false, error: "Template not found" };

    const copy = await prisma.template.create({
      data: {
        title: `${row.title} copy`,
        category: row.category,
        badge: row.badge,
        previewUrl: row.previewUrl,
        aspectRatio: row.aspectRatio,
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
    return { success: false, error: "Couldn't duplicate the template" };
  }
}

export async function updateTemplateMeta(
  templateId: string,
  input: { title?: string; category?: string; badge?: string | null },
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: "Sign in" };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
      select: { authorId: true },
    });
    if (!row) return { success: false, error: "Template not found" };

    const owns = row.authorId === user.id;
    if (!owns && !isAdminUser(user)) {
      return { success: false, error: "You can't edit this template" };
    }

    const data: { title?: string; category?: string; badge?: string | null } = {};
    if (typeof input.title === "string") {
      const title = input.title.trim();
      if (!title) return { success: false, error: "Enter a name" };
      data.title = title;
    }
    if (typeof input.category === "string") {
      const category = input.category.trim();
      if (!category) return { success: false, error: "Enter a category" };
      data.category = category;
    }
    if (input.badge !== undefined) {
      data.badge = input.badge?.trim() || null;
    }
    if (Object.keys(data).length === 0) {
      return { success: false, error: "Nothing to update" };
    }

    await prisma.template.update({ where: { id: templateId }, data });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("updateTemplateMeta error:", err);
    return { success: false, error: "Couldn't update the template" };
  }
}

export async function deleteTemplate(
  templateId: string,
): Promise<ActionResult<object>> {
  try {
    const user = await requireUser();
    if (!user) return { success: false, error: "Sign in" };

    const row = await prisma.template.findUnique({
      where: { id: templateId },
      select: { id: true, authorId: true },
    });
    if (!row) return { success: false, error: "Template not found" };

    const owns = row.authorId === user.id;
    if (!owns && !isAdminUser(user)) {
      return { success: false, error: "You can't delete this template" };
    }

    await prisma.template.delete({ where: { id: templateId } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("deleteTemplate error:", err);
    return { success: false, error: "Couldn't delete the template" };
  }
}
