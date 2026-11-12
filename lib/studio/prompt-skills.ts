export type PromptSkillId =
  | "launch"
  | "howto"
  | "offer"
  | "tips"
  | "story"
  | "comparison";

export type PromptSkill = {
  id: PromptSkillId;
  /** Default slides when this skill is active. */
  slidesCount: number;
  /** Shape the user brief into a generation-ready topic. */
  apply: (topic: string) => string;
};

const SKILLS: PromptSkill[] = [
  {
    id: "launch",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build a product-launch carousel.",
        "Structure: hook → offer → who it's for → proof → details → clear CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  {
    id: "howto",
    slidesCount: 7,
    apply: (topic) =>
      [
        "Build a how-to carousel. Each slide is one clear step; last slide is the result.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  {
    id: "offer",
    slidesCount: 5,
    apply: (topic) =>
      [
        "Build an offer carousel: problem → solution → proof → price or value → next step.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  {
    id: "tips",
    slidesCount: 7,
    apply: (topic) =>
      [
        "Build a tips carousel. Slide 1 is the theme; each following slide is one concrete tip; end with a recap CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  {
    id: "story",
    slidesCount: 6,
    apply: (topic) =>
      [
        "Build a short case-study / story carousel: context → tension → what changed → result → takeaway → CTA.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
  {
    id: "comparison",
    slidesCount: 5,
    apply: (topic) =>
      [
        "Build a comparison carousel (before/after or option A vs B). Keep claims concrete and end with a recommendation.",
        `Brief: ${topic}`,
      ].join("\n"),
  },
];

export function listPromptSkills(): PromptSkill[] {
  return SKILLS;
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
