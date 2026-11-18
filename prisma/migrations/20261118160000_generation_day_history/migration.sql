-- Per-day generation counts for usage heatmap.
CREATE TABLE IF NOT EXISTS "GenerationDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GenerationDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GenerationDay_userId_dayKey_key" ON "GenerationDay"("userId", "dayKey");
CREATE INDEX IF NOT EXISTS "GenerationDay_userId_dayKey_idx" ON "GenerationDay"("userId", "dayKey");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GenerationDay_userId_fkey'
  ) THEN
    ALTER TABLE "GenerationDay"
      ADD CONSTRAINT "GenerationDay_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill today from User counters when present.
INSERT INTO "GenerationDay" ("id", "userId", "dayKey", "count")
SELECT
  gen_random_uuid()::text,
  u."id",
  u."generationDayKey",
  u."generationsUsedToday"
FROM "User" u
WHERE u."generationDayKey" IS NOT NULL
  AND u."generationsUsedToday" > 0
ON CONFLICT ("userId", "dayKey") DO UPDATE
SET "count" = EXCLUDED."count";
