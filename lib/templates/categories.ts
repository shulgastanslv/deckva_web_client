// 1. ПЛАТФОРМЫ
export const PLATFORMS = [
  "Instagram",
  "TikTok",
  "Threads",
  "LinkedIn",
  "Telegram",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

// 2. КАТЕГОРИИ ШАБЛОНОВ (50 форматов)
export const TEMPLATE_CATEGORIES = [
  // Обучение и Польза
  "Step-by-Step",
  "Listicle",
  "Tips & Tricks",
  "Myths vs Facts",
  "Checklist",
  "Mistakes to Avoid",
  "Tools & Resources",
  "Cheat Sheet",
  "Glossary",
  "Do's & Don'ts",
  "Mini-Course",
  "Pros & Cons",
  "Comparison",

  // Личный Бренд и Истории
  "Storytelling",
  "Success Story",
  "Failure Story",
  "Lessons Learned",
  "Behind the Scenes",
  "Day in the Life",
  "Roadmap",
  "Mindset Shift",
  "Expectation vs Reality",
  "Manifesto",

  // Экспертность и Авторитет
  "Hot Takes",
  "Unpopular Opinion",
  "Industry Trends",
  "Predictions",
  "Stats & Data",
  "Case Study",
  "Workflow",
  "Portfolio",
  "Recommendations",
  "Q&A",

  // Вовлечение и Интерактив
  "Challenge",
  "Interactive",
  "Relatable Situations",
  "Memes",
  "Weekly Recap",
  "Event Recap",

  // Мотивация и Лайфстайл
  "Quotes & Motivation",
  "Productivity Hacks",
  "Mental Health",
  "Life Hacks",
  "Financial Tips",
  "Gift Guides",

  // Продажи и Маркетинг
  "Before & After",
  "Client Reviews",
  "Product Launch",
  "Feature Highlight",
  "Teaser",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export function isTemplateCategory(value: string): value is TemplateCategory {
  return (TEMPLATE_CATEGORIES as readonly string[]).includes(value);
}

// 3. МАППИНГ ПЛАТФОРМ (если нужно приводить старые/внешние значения к единому формату)
export const NORMALIZE_PLATFORM: Record<string, Platform | null> = {
  Insta: "Instagram",
  Instagram: "Instagram",
  TikTok: "TikTok",
  Threads: "Threads",
  LinkedIn: "LinkedIn",
  Telegram: "Telegram",
  Other: null,
};