import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import type { Database, ProfileFollowCounts } from "../types/database";

export type ProfileFollowStats = {
  brandFollowers: number;
  creatorFollowers: number;
  followingCount: number;
  totalFollowers: number;
};

const EMPTY_FOLLOW_STATS: ProfileFollowStats = {
  brandFollowers: 0,
  creatorFollowers: 0,
  followingCount: 0,
  totalFollowers: 0
};

function normalizeFollowStats(row: ProfileFollowCounts | null | undefined): ProfileFollowStats {
  return {
    brandFollowers: row?.brand_followers ?? 0,
    creatorFollowers: row?.creator_followers ?? 0,
    followingCount: row?.following_count ?? 0,
    totalFollowers: row?.total_followers ?? 0
  };
}

async function invalidateFollowQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  currentUserId: string | null | undefined,
  profileId: string
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["profile-follow-stats", profileId] }),
    queryClient.invalidateQueries({ queryKey: ["profile-follow-stats", currentUserId] }),
    queryClient.invalidateQueries({ queryKey: ["profile-follow-state", currentUserId, profileId] })
  ]);
}

export function useProfileFollowStats(profileId: string | null | undefined) {
  return useQuery<ProfileFollowStats>({
    queryKey: ["profile-follow-stats", profileId],
    enabled: Boolean(profileId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_follow_counts")
        .select("*")
        .eq("profile_id", profileId!)
        .maybeSingle();

      if (error) throw error;
      return normalizeFollowStats(data as ProfileFollowCounts | null);
    },
    placeholderData: EMPTY_FOLLOW_STATS,
    staleTime: 10_000
  });
}

export function useProfileFollowState(profileId: string | null | undefined) {
  const { profile } = useAuth();
  const currentUserId = profile?.id ?? null;

  return useQuery<boolean>({
    queryKey: ["profile-follow-state", currentUserId, profileId],
    enabled: Boolean(currentUserId && profileId && currentUserId !== profileId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_follows")
        .select("follower_id")
        .eq("follower_id", currentUserId!)
        .eq("following_id", profileId!)
        .maybeSingle();

      if (error) throw error;
      return Boolean(data);
    },
    placeholderData: false,
    staleTime: 10_000
  });
}

export function useToggleProfileFollow(profileId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const currentUserId = profile?.id ?? null;

  return useMutation<boolean, unknown, { isFollowing: boolean }>({
    mutationFn: async ({ isFollowing }) => {
      if (!currentUserId || !profileId) throw new Error("NOT_SIGNED_IN");
      if (currentUserId === profileId) throw new Error("CANNOT_FOLLOW_SELF");

      if (isFollowing) {
        const { error } = await supabase
          .from("profile_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", profileId);
        if (error) throw error;
        return false;
      }

      const payload = {
        follower_id: currentUserId,
        following_id: profileId
      } satisfies Database["public"]["Tables"]["profile_follows"]["Insert"];

      const { error } = await supabase.from("profile_follows").insert(payload);
      if (error && error.code !== "23505") throw error;
      return true;
    },
    onSuccess: async () => {
      if (!profileId) return;
      await invalidateFollowQueries(queryClient, currentUserId, profileId);
    }
  });
}
