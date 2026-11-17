-- Daily generation quota on User; drop billing / subscription / credits.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "generationsUsedToday" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "generationDayKey" TEXT;

DROP TABLE IF EXISTS "CreditLedgerEntry";
DROP TABLE IF EXISTS "BillingPayment";
DROP TABLE IF EXISTS "PaymentMethod";

ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionStatus";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionEndsAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "cancelAtPeriodEnd";
ALTER TABLE "User" DROP COLUMN IF EXISTS "paymentCustomerId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "freeGenerationsUsed";
ALTER TABLE "User" DROP COLUMN IF EXISTS "creditPlanBalance";
ALTER TABLE "User" DROP COLUMN IF EXISTS "creditTopupBalance";

DROP TYPE IF EXISTS "CreditLedgerKind";
DROP TYPE IF EXISTS "CreditBucket";
DROP TYPE IF EXISTS "BillingPaymentKind";
DROP TYPE IF EXISTS "BillingPaymentStatus";
DROP TYPE IF EXISTS "SubscriptionStatus";
