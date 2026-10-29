export const SOCIAL_LINKS = {
  threads:
    process.env.NEXT_PUBLIC_THREADS_URL ||
    "https://www.threads.com/@theshulyaa",
  telegram:
    process.env.NEXT_PUBLIC_TELEGRAM_URL ||
    "https://t.me/+WDbWByhNA480Mjgy",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://www.instagram.com/theshulyaa",
  tiktok:
    process.env.NEXT_PUBLIC_TIKTOK_URL ||
    "https://www.tiktok.com/@theshulyaa",
} as const;
