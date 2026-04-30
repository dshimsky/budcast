import type { Badge, UserType } from "../types/database";

export type TrustBadgeId =
  | "verified_brand"
  | "verified_creator"
  | "payment_ready"
  | "campaign_ready"
  | "social_verified"
  | "highly_rated";

export type TrustBadgeTone = "lime" | "gold" | "aqua" | "violet" | "blue";

export type TrustBadgeDescriptor = {
  description: string;
  id: TrustBadgeId;
  label: string;
  tone: TrustBadgeTone;
};

const TRUST_BADGES: Record<TrustBadgeId, TrustBadgeDescriptor> = {
  verified_brand: {
    description: "BudCast has reviewed this brand identity.",
    id: "verified_brand",
    label: "Verified Brand",
    tone: "lime"
  },
  verified_creator: {
    description: "BudCast has reviewed this creator profile.",
    id: "verified_creator",
    label: "Verified Creator",
    tone: "aqua"
  },
  payment_ready: {
    description: "This brand has a clear payment workflow for paid campaigns.",
    id: "payment_ready",
    label: "Payment Ready",
    tone: "gold"
  },
  campaign_ready: {
    description: "This creator profile is ready for campaign review.",
    id: "campaign_ready",
    label: "Campaign Ready",
    tone: "violet"
  },
  social_verified: {
    description: "Connected social presence is available for review.",
    id: "social_verified",
    label: "Social Verified",
    tone: "blue"
  },
  highly_rated: {
    description: "This profile has strong marketplace reviews.",
    id: "highly_rated",
    label: "Highly Rated",
    tone: "gold"
  }
};

const BADGE_ALIASES: Record<string, TrustBadgeId> = {
  campaign_ready: "campaign_ready",
  founding_brand: "verified_brand",
  founding_creator: "verified_creator",
  highly_rated: "highly_rated",
  payment_ready: "payment_ready",
  social_verified: "social_verified",
  top_rated: "highly_rated",
  trusted_creator: "campaign_ready",
  verified_brand: "verified_brand",
  verified_creator: "verified_creator",
  verified_payer: "payment_ready"
};

const PROFILE_BADGE_ORDER: Record<UserType, TrustBadgeId[]> = {
  brand: ["verified_brand", "payment_ready", "social_verified", "highly_rated", "campaign_ready", "verified_creator"],
  brand_team: ["verified_brand", "social_verified", "highly_rated", "payment_ready", "campaign_ready", "verified_creator"],
  creator: ["verified_creator", "campaign_ready", "social_verified", "highly_rated", "payment_ready", "verified_brand"]
};

export function getTrustBadgeDescriptors({
  badges,
  profileType
}: {
  badges?: Array<Badge | string> | null;
  profileType: UserType;
}): TrustBadgeDescriptor[] {
  const ids = new Set<TrustBadgeId>();

  for (const badge of badges ?? []) {
    const id = BADGE_ALIASES[badge];
    if (id) ids.add(id);
  }

  return PROFILE_BADGE_ORDER[profileType]
    .filter((id) => ids.has(id))
    .map((id) => TRUST_BADGES[id]);
}

export function getPrimaryTrustBadge({
  badges,
  profileType
}: {
  badges?: Array<Badge | string> | null;
  profileType: UserType;
}): TrustBadgeDescriptor | null {
  return getTrustBadgeDescriptors({ badges, profileType })[0] ?? null;
}
