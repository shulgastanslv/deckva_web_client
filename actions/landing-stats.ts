"use server";

export type LandingStats = {
  users: number;
  templates: number;
  projects: number;
};

export async function getLandingStats(): Promise<LandingStats | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const [users, templates, projects] = await Promise.all([
      prisma.user.count(),
      prisma.template.count(),
      prisma.project.count(),
    ]);
    return { users, templates, projects };
  } catch {
    return null;
  }
}
