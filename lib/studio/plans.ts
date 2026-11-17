/** Daily successful AI generations per signed-in user (UTC calendar day). */
export const DAILY_GENERATION_LIMIT = 15;

export function dailyGenerationLimitMessage(limit = DAILY_GENERATION_LIMIT) {
  return `You've used your ${limit} generations for today. Come back tomorrow.`;
}
