/** Fixed community categories for publish + browse filters (Threads / Instagram). */
export const COMMUNITY_CATEGORIES = [
  "Business",
  "Startup",
  "Marketing",
  "Sales",
  "Product",
  "SaaS",
  "Tech",
  "AI",
  "Design",
  "Creative",
  "Branding",
  "Content",
  "Copywriting",
  "Social media",
  "Threads",
  "Instagram",
  "Personal brand",
  "Creator",
  "Education",
  "How-to",
  "Career",
  "Freelance",
  "Finance",
  "Investing",
  "Health",
  "Fitness",
  "Lifestyle",
  "Personal",
  "Travel",
  "Food",
  "Fashion",
  "Beauty",
  "Parenting",
  "Productivity",
  "Mindset",
  "News",
  "Events",
  "Community",
  "Other",
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export function isCommunityCategory(value: string): value is CommunityCategory {
  return (COMMUNITY_CATEGORIES as readonly string[]).includes(value);
}

export type CommunitySortId =
  | "newest"
  | "updated"
  | "oldest"
  | "alphabetical";

export const COMMUNITY_SORT_OPTIONS: Array<{
  id: CommunitySortId;
  label: string;
}> = [
  { id: "newest", label: "Newest" },
  { id: "updated", label: "Recently updated" },
  { id: "oldest", label: "Oldest" },
  { id: "alphabetical", label: "A–Z" },
];
