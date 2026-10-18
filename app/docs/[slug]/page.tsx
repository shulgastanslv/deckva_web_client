import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsShell } from "@/components/docs/docs-shell";
import {
  DEFAULT_DOC_SLUG,
  getAllDocSlugs,
  getDocPage,
} from "@/lib/docs/content";

type DocsParams = { slug: string };

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<DocsParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocPage(slug) ?? getDocPage(DEFAULT_DOC_SLUG);
  const blurb = page?.blocks.find(
    (block) => block.type === "callout" || block.type === "p",
  );
  return {
    title: page ? `${page.title} · Docs` : "Docs",
    description:
      blurb && (blurb.type === "callout" || blurb.type === "p")
        ? blurb.text
        : "Swibp documentation",
  };
}

export default async function DocsSlugPage({
  params,
}: {
  params: Promise<DocsParams>;
}) {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) notFound();
  return <DocsShell page={page} />;
}
