import { fetchAiGet } from "@/lib/ai/client";
import type { AiModelInfo, AiPlanId } from "@/lib/ai/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function listAiModelsUpstream(
  plan: AiPlanId = "free",
): Promise<{ plan: AiPlanId; models: AiModelInfo[] }> {
  const payload = (await fetchAiGet("/models", {
    label: "AI models",
    params: { plan },
  })) as Record<string, unknown>;

  const modelsRaw = Array.isArray(payload.models) ? payload.models : [];
  const models: AiModelInfo[] = [];
  for (const row of modelsRaw) {
    if (!isRecord(row)) continue;
    if (typeof row.modelId !== "string" || typeof row.displayName !== "string") {
      continue;
    }
    const tier =
      row.tier === "standard" || row.tier === "premium"
        ? row.tier
        : "economy";
    const slug =
      typeof row.openRouterSlug === "string" ? row.openRouterSlug : "";
    models.push({
      modelId: row.modelId,
      displayName: row.displayName,
      tier,
      openRouterSlug: slug,
      enabled: row.enabled !== false,
      isFree:
        row.isFree === true ||
        slug.endsWith(":free") ||
        slug === "openrouter/free",
    });
  }

  return {
    plan: payload.plan === "pro" ? "pro" : "free",
    models,
  };
}
