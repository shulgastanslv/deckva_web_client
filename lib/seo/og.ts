/** Shared Open Graph / Twitter card image for link previews (Telegram, etc.). */
export const SITE_URL = "https://deckva.by" as const;

/** Cache-bust when replacing public/presentation.png so messengers refetch. */
export const OG_IMAGE_PATH = "/presentation.png?v=20261125" as const;

export const ogImage = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: "Deckva — AI Carousel Editor",
  type: "image/png",
} as const;
