/** Fixed community categories for publish + browse filters. */
export const COMMUNITY_CATEGORIES = [
  "Business",
  "Lifestyle",
  "Education",
  "Marketing",
  "Health",
  "Finance",
  "Tech",
  "Creative",
  "Personal",
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
