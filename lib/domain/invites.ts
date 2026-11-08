import { OrganizationInviteStatus } from "@/lib/generated/prisma/enums";

export { OrganizationInviteStatus };

/** Outcome of sending one invite email / notification. */
export const InviteSendStatus = {
  invited: "invited",
  notified: "notified",
  already_member: "already_member",
  invalid: "invalid",
} as const;

export type InviteSendStatus =
  (typeof InviteSendStatus)[keyof typeof InviteSendStatus];
