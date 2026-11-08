/**
 * Platform and organization roles — single source aligned with Prisma enums.
 * Import from here in app code instead of raw "OWNER" / "ADMIN" strings.
 */
import {
  OrgMemberRole,
  UserRole,
} from "@/lib/generated/prisma/enums";

export { OrgMemberRole, UserRole };

/** Roles that can invite members and manage org resources. */
export function isOrgManager(
  role: OrgMemberRole | string | null | undefined,
): boolean {
  return role === OrgMemberRole.OWNER || role === OrgMemberRole.ADMIN;
}

export function isOrgOwner(
  role: OrgMemberRole | string | null | undefined,
): boolean {
  return role === OrgMemberRole.OWNER;
}

export function isPlatformAdmin(
  role: UserRole | string | null | undefined,
): boolean {
  return role === UserRole.ADMIN;
}

/** Roles an owner/admin may assign when inviting (never OWNER). */
export const INVITEABLE_ORG_ROLES = [
  OrgMemberRole.MEMBER,
  OrgMemberRole.ADMIN,
] as const;

export type InviteableOrgRole = (typeof INVITEABLE_ORG_ROLES)[number];

export function isInviteableOrgRole(value: unknown): value is InviteableOrgRole {
  return value === OrgMemberRole.MEMBER || value === OrgMemberRole.ADMIN;
}
