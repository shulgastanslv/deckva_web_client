import { redirect } from "next/navigation";

import { DEFAULT_DOC_SLUG } from "@/lib/docs/content";

export default function DocsIndexPage() {
  redirect(`/docs/${DEFAULT_DOC_SLUG}`);
}
