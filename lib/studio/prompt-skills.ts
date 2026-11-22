export type PromptSkillId =
  | "launch"
  | "howto"
  | "offer"
  | "tips"
  | "story"
  | "comparison"
  | "checklist"
  | "myths"
  | "framework"
  | "pricing"
  | "aesthetic";

export type PromptSkillGroupId = "sell" | "teach" | "engage" | "editorial";

export type PromptSkill = {
  id: PromptSkillId;
  /** Default slides when this skill is active. */
  slidesCount: number;
  /** Shape the user brief into a generation-ready topic. */
  apply: (topic: string) => string;
};

export type PromptSkillGroup = {
  id: PromptSkillGroupId;
  skills: PromptSkill[];
};

/** Old editorial skills collapsed into aesthetic (server randomizes variants). */
const LEGACY_SKILL_ALIASES: Record<string, PromptSkillId> = {
  manifesto: "aesthetic",
  niches: "aesthetic",
  lookbook: "aesthetic",
};

const SKILL_BY_ID: Record<PromptSkillId, PromptSkill> = {
  launch: {
    id: "launch",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build a product-launch carousel.",
        "Structure: hook → offer → who it's for → proof → details → clear CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  howto: {
    id: "howto",
    slidesCount: 7,
    apply: (topic) =>
      [
        "Build a how-to carousel. Each slide is one clear step; last slide is the result.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  offer: {
    id: "offer",
    slidesCount: 5,
    apply: (topic) =>
      [
        "Build an offer carousel: problem → solution → proof → price or value → next step.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  tips: {
    id: "tips",
    slidesCount: 7,
    apply: (topic) =>
      [
        "Build a tips carousel. Slide 1 is the theme; each following slide is one concrete tip; end with a recap CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  story: {
    id: "story",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build a short case-study / story carousel: context → tension → what changed → result → takeaway → CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  comparison: {
    id: "comparison",
    slidesCount: 5,
    apply: (topic) =>
      [
        "Build a comparison carousel (before/after or option A vs B). Keep claims concrete and end with a recommendation.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  checklist: {
    id: "checklist",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build a checklist carousel. Cover states the goal; each mid slide is one item to complete; end with a ready CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  myths: {
    id: "myths",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build a myth-busting carousel: one common myth per mid slide, then the truth; end with a clear takeaway CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  framework: {
    id: "framework",
    slidesCount: 7,
    apply: (topic) =>
      [
        "Build a framework carousel: name the model, walk through 3–4 stages, show how to apply it, then CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  pricing: {
    id: "pricing",
    slidesCount: 5,
    apply: (topic) =>
      [
        "Build a pricing carousel: tiers, who each is for, what’s included, how to choose, then a purchase CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  aesthetic: {
    id: "aesthetic",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build an aesthetic / editorial lifestyle carousel.",
        "Cover style is chosen on the server (portrait, editorial brackets, diptych, collage, manifesto, niches).",
        "Soft lowercase hook; one calm tip or frame idea per mid slide; soft CTA — not salesy.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
};

const SKILL_GROUP_IDS: Record<PromptSkillGroupId, PromptSkillId[]> = {
  sell: ["launch", "offer", "pricing"],
  teach: ["howto", "tips", "checklist", "framework"],
  engage: ["story", "comparison", "myths"],
  editorial: ["aesthetic"],
};

const SKILL_GROUPS: PromptSkillGroup[] = (
  Object.keys(SKILL_GROUP_IDS) as PromptSkillGroupId[]
).map((id) => ({
  id,
  skills: SKILL_GROUP_IDS[id].map((skillId) => SKILL_BY_ID[skillId]),
}));

const SKILLS: PromptSkill[] = SKILL_GROUPS.flatMap((group) => group.skills);

export function listPromptSkills(): PromptSkill[] {
  return SKILLS;
}

export function listPromptSkillGroups(): PromptSkillGroup[] {
  return SKILL_GROUPS;
}

export function resolvePromptSkillId(
  id: string | null | undefined,
): PromptSkillId | null {
  if (!id) return null;
  const key = id.trim().toLowerCase();
  const mapped = LEGACY_SKILL_ALIASES[key] ?? key;
  return mapped in SKILL_BY_ID ? (mapped as PromptSkillId) : null;
}

export function getPromptSkill(id: string | null | undefined): PromptSkill | null {
  const resolved = resolvePromptSkillId(id);
  if (!resolved) return null;
  return SKILL_BY_ID[resolved];
}

export function applyPromptSkill(
  topic: string,
  skillId: string | null | undefined,
): { topic: string; slidesCount?: number; skillId?: PromptSkillId } {
  const trimmed = topic.trim();
  const skill = getPromptSkill(skillId);
  if (!skill || !trimmed) {
    return { topic: trimmed };
  }
  return {
    topic: skill.apply(trimmed),
    slidesCount: skill.slidesCount,
    skillId: skill.id,
  };
}
