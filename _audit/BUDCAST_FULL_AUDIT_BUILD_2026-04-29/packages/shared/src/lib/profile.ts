import type { User } from "../types/database";

export function hasCompletedOnboarding(profile: User | null) {
  if (!profile?.user_type) return false;

  if (profile.user_type === "creator") {
    return Boolean(profile.name?.trim() && profile.instagram?.trim());
  }

  return Boolean((profile.company_name || profile.name)?.trim());
}
