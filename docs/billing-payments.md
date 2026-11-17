# Billing

Payments, subscriptions, and credits are removed. Deckva is free with a
per-user daily generation limit (`DAILY_GENERATION_LIMIT` in
`lib/studio/plans.ts`).

Usage is tracked on `User.generationsUsedToday` + `User.generationDayKey`
(UTC calendar day). See `lib/studio/generations.ts`.
