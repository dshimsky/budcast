import { hasCompletedOnboarding, type User, type UserType } from "@budcast/shared";

export function getWorkspaceHref(profile: User | null) {
  if (!hasCompletedOnboarding(profile)) return "/onboarding";
  if (profile?.user_type === "brand" || profile?.user_type === "brand_team") return "/dashboard";
  if (profile?.user_type === "creator") return "/creator-dashboard";
  return "/profile";
}

export function getWorkspaceHrefForUserType(userType: UserType) {
  return userType === "brand" || userType === "brand_team" ? "/dashboard" : "/creator-dashboard";
}
