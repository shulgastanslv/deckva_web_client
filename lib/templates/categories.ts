export const TEMPLATE_CATEGORIES = [
  "Кофе",
  "Путешествия",
  "Спорт",
  "Еда",
  "Деньги",
  "Книги",
  "Стартап",
  "Уход",
  "Дизайн",
  "Работа",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export function isTemplateCategory(value: string): value is TemplateCategory {
  return (TEMPLATE_CATEGORIES as readonly string[]).includes(value);
}
