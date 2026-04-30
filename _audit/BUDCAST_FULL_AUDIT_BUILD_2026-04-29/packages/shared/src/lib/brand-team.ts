import type { BrandTeamCapability, BrandTeamRole } from "../types/database";

export const BRAND_TEAM_ROLES = [
  "owner",
  "admin",
  "campaign_manager",
  "content_reviewer",
  "viewer"
] as const satisfies readonly BrandTeamRole[];

export const BRAND_TEAM_CAPABILITIES = [
  "manage_team",
  "manage_campaigns",
  "review_applicants",
  "review_submissions",
  "message_creators",
  "view_brand_activity",
  "confirm_payment_product",
  "manage_brand_profile"
] as const satisfies readonly BrandTeamCapability[];

const ROLE_LABELS: Record<BrandTeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  campaign_manager: "Campaign Manager",
  content_reviewer: "Content Reviewer",
  viewer: "Viewer"
};

const ROLE_CAPABILITIES: Record<BrandTeamRole, readonly BrandTeamCapability[]> = {
  owner: BRAND_TEAM_CAPABILITIES,
  admin: BRAND_TEAM_CAPABILITIES,
  campaign_manager: [
    "manage_campaigns",
    "review_applicants",
    "message_creators",
    "view_brand_activity"
  ],
  content_reviewer: [
    "review_submissions",
    "message_creators",
    "view_brand_activity"
  ],
  viewer: ["view_brand_activity"]
};

export interface BrandTeamDisplayInput {
  brandName: string | null | undefined;
  role?: BrandTeamRole | null;
  title?: string | null;
}

export function getBrandTeamRoleLabel(role: BrandTeamRole): string {
  return ROLE_LABELS[role];
}

export function canBrandTeamRole(role: BrandTeamRole, capability: BrandTeamCapability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function getBrandTeamDisplayLine(input: BrandTeamDisplayInput): string {
  const title = input.title?.trim() || (input.role ? getBrandTeamRoleLabel(input.role) : "Team Member");
  const brandName = input.brandName?.trim();

  return brandName ? `${title} at ${brandName}` : title;
}
