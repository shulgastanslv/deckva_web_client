import type { Metadata } from "next";

import { StudioInvitePage } from "@/components/studio/invite/studio-invite-page";

export const metadata: Metadata = {
  title: "Join organization · Deckva",
  description: "Accept an invite to join a Deckva organization.",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <StudioInvitePage token={token} />;
}
