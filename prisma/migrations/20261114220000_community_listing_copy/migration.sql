-- Community / template listing copy: description + key moments.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "communityDescription" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "communityKeyMoments" TEXT[] DEFAULT ARRAY[]::TEXT[];
