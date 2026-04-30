import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import { useOnboarding } from "../stores/onboarding";
import type { Database, User } from "../types/database";

export interface SaveProfileInput {
  userType: "creator" | "brand" | "brand_team";
}

function buildProfilePayload(
  input: SaveProfileInput,
  onboarding: ReturnType<typeof useOnboarding.getState>
): Database["public"]["Functions"]["update_profile_rpc"]["Args"] {
  const base = {
    p_user_type: input.userType,
    p_name: onboarding.name.trim() || null,
    p_bio: onboarding.bio.trim() || null,
    p_location: onboarding.location.trim() || null,
    p_avatar_url: onboarding.avatarUrl.trim() || null,
    p_cover_url: onboarding.coverUrl.trim() || null
  } satisfies Partial<Database["public"]["Functions"]["update_profile_rpc"]["Args"]>;

  if (input.userType === "creator" || input.userType === "brand_team") {
    return {
      ...base,
      p_instagram: onboarding.instagram.trim() || null,
      p_tiktok: onboarding.tiktok.trim() || null,
      p_youtube: onboarding.youtube.trim() || null,
      p_facebook: onboarding.facebook.trim() || null,
      p_linkedin: onboarding.linkedin.trim() || null,
      p_x_profile: onboarding.xProfile.trim() || null,
      p_portfolio_image_urls: onboarding.portfolioImageUrls.filter((url) => url.trim()).map((url) => url.trim()),
      p_niches: onboarding.niches
    };
  }

  return {
    ...base,
    p_company_name: onboarding.companyName.trim() || null,
    p_website: onboarding.website.trim() || null,
    p_instagram: onboarding.instagram.trim() || null,
    p_tiktok: onboarding.tiktok.trim() || null,
    p_youtube: onboarding.youtube.trim() || null,
    p_facebook: onboarding.facebook.trim() || null,
    p_linkedin: onboarding.linkedin.trim() || null,
    p_x_profile: onboarding.xProfile.trim() || null,
    p_portfolio_image_urls: onboarding.portfolioImageUrls.filter((url) => url.trim()).map((url) => url.trim()),
    p_niches: onboarding.niches
  };
}

export function useSaveProfile() {
  const { authUser, refreshProfile } = useAuth();

  return useMutation<User, Error, SaveProfileInput>({
    mutationFn: async (input) => {
      if (!authUser?.id) {
        throw new Error("NOT_SIGNED_IN");
      }

      const payload = buildProfilePayload(input, useOnboarding.getState());
      const { data, error } = await supabase.rpc("update_profile_rpc", payload);

      if (error) throw error;
      return data as User;
    },
    onSuccess: async () => {
      await refreshProfile();
      useOnboarding.getState().reset();
    }
  });
}
