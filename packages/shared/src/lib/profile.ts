import type { User } from "../types/database";

export function hasCompletedOnboarding(profile: User | null) {
  if (!profile?.user_type) return false;

  if (profile.user_type === "creator") {
    return Boolean(profile.name?.trim() && profile.instagram?.trim());
  }

  return Boolean((profile.company_name || profile.name)?.trim());
}

export function hasCompletedTrustCompliance(profile: User | null) {
  return Boolean(
    profile?.age_verified &&
      profile.market_eligible &&
      profile.terms_accepted_at &&
      profile.state_code?.trim() &&
      profile.compliance_step === "complete"
  );
}

export function getTrustComplianceGateCopy(profile: User | null) {
  if (!profile) return "Sign in before using BudCast campaign tools.";
  if (!profile.age_verified) return "Confirm you are 21 or older before using BudCast campaign tools.";
  if (!profile.state_code?.trim()) return "Select your state before using BudCast campaign tools.";
  if (!profile.market_eligible) return "BudCast campaign tools require a legal cannabis market.";
  if (!profile.terms_accepted_at || profile.compliance_step !== "complete") {
    return "Accept BudCast cannabis marketing terms before continuing.";
  }
  return "Your trust and compliance setup is complete.";
}
