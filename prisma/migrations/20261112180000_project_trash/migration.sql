-- Soft-delete / Trash for projects
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "trashedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Project_userId_trashedAt_idx" ON "Project"("userId", "trashedAt");
CREATE INDEX IF NOT EXISTS "Project_trashedAt_idx" ON "Project"("trashedAt");
