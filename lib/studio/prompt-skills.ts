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
  | "aesthetic"
  | "manifesto"
  | "niches"
  | "lookbook";

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
        "Build an aesthetic lifestyle carousel (full-bleed cover). Soft lowercase hook; one calm tip or idea per mid slide; soft CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  manifesto: {
    id: "manifesto",
    slidesCount: 5,
    apply: (topic) =>
      [
        "Build a manifesto carousel. Cover is a short stacked slogan (3–6 words); mid slides unpack the stance; close with CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  niches: {
    id: "niches",
    slidesCount: 7,
    apply: (topic) =>
      [
        "Build a niches / ideas-for-experts carousel. Cover lists niche names; each mid slide is one niche tip; end with CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  lookbook: {
    id: "lookbook",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build a lookbook / photo-ideas carousel. Cover is an idea title with a short save-cue; mid slides are frame ideas; end with CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
};

const SKILL_GROUP_IDS: Record<PromptSkillGroupId, PromptSkillId[]> = {
  sell: ["launch", "offer", "pricing"],
  teach: ["howto", "tips", "checklist", "framework"],
  engage: ["story", "comparison", "myths"],
  editorial: ["aesthetic", "manifesto", "niches", "lookbook"],
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

export function getPromptSkill(id: string | null | undefined): PromptSkill | null {
  if (!id) return null;
  return SKILLS.find((skill) => skill.id === id) ?? null;
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
