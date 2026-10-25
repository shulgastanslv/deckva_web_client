/**
 * Seed Built-in templates from `templates/*.json`.
 *
 *   npx tsx scripts/seed-templates.ts
 *   npm run seed:templates
 */
import "dotenv/config";

import { seedBuiltinTemplates } from "../lib/templates/seed";

async function main() {
  const result = await seedBuiltinTemplates({ replace: true });
  console.log(
    `Templates seed: +${result.created} created, ~${result.updated} updated, ${result.skipped} skipped`,
  );
  for (const row of result.templates) {
    console.log(`  [${row.action}] ${row.title} (${row.sourceKey}) → ${row.id}`);
  }
  for (const err of result.errors) {
    console.error(`  ! ${err.file}: ${err.error}`);
  }
  if (result.errors.length > 0 && result.created + result.updated === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
