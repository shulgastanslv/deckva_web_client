-- Community listing meta: category, republish stamp, last editor.

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "communityUpdatedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "communityCategory" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "communityUpdatedById" TEXT;

CREATE INDEX IF NOT EXISTS "Project_communityCategory_communityStatus_idx"
  ON "Project"("communityCategory", "communityStatus");
CREATE INDEX IF NOT EXISTS "Project_communityUpdatedAt_idx"
  ON "Project"("communityUpdatedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Project_communityUpdatedById_fkey'
  ) THEN
    ALTER TABLE "Project"
      ADD CONSTRAINT "Project_communityUpdatedById_fkey"
      FOREIGN KEY ("communityUpdatedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
