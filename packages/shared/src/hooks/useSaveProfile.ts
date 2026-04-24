import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import { useOnboarding } from "../stores/onboarding";
import type { Database, User } from "../types/database";

export interface SaveProfileInput {
  userType: "creator" | "brand";
}

function buildProfilePayload(
  input: SaveProfileInput,
  authUser: { id: string; email?: string | null },
  onboarding: ReturnType<typeof useOnboarding.getState>
): Database["public"]["Tables"]["users"]["Insert"] {
  const base = {
    id: authUser.id,
    email: authUser.email ?? "",
    user_type: input.userType,
    name: onboarding.name.trim() || null,
    bio: onboarding.bio.trim() || null,
    location: onboarding.location.trim() || null
  } satisfies Partial<User>;

  if (input.userType === "creator") {
    return {
      ...base,
      instagram: onboarding.instagram.trim() || null,
      tiktok: onboarding.tiktok.trim() || null,
      youtube: onboarding.youtube.trim() || null,
      niches: onboarding.niches
    };
  }

  return {
    ...base,
    company_name: onboarding.companyName.trim() || null,
    website: onboarding.website.trim() || null
  };
}

export function useSaveProfile() {
  const { authUser, refreshProfile } = useAuth();

  return useMutation<User, Error, SaveProfileInput>({
    mutationFn: async (input) => {
      if (!authUser?.id) {
        throw new Error("NOT_SIGNED_IN");
      }

      const payload = buildProfilePayload(input, authUser, useOnboarding.getState());
      const { data, error } = await supabase
        .from("users")
        .upsert(payload, { onConflict: "id" })
        .select("*")
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: async () => {
      await refreshProfile();
      useOnboarding.getState().reset();
    }
  });
}
