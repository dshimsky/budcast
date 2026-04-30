"use client";

import { UserPlus } from "lucide-react";
import { useAuth, useProfileFollowState, useToggleProfileFollow } from "@budcast/shared";

type ProfileFollowButtonProps = {
  className?: string;
  profileId?: string | null;
};

export function ProfileFollowButton({ className, profileId }: ProfileFollowButtonProps) {
  const { profile } = useAuth();
  const followState = useProfileFollowState(profileId);
  const toggleFollow = useToggleProfileFollow(profileId);
  const isOwnProfile = Boolean(profile?.id && profileId && profile.id === profileId);

  if (!profileId || isOwnProfile) return null;

  const isFollowing = Boolean(followState.data);

  return (
    <button
      className={
        className ??
        `inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition active:scale-95 ${
          isFollowing
            ? "border border-[#b8ff3d]/24 bg-[#b8ff3d]/10 text-[#e7ff9a] hover:bg-[#b8ff3d]/14"
            : "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.22),0_1px_0_rgba(255,255,255,0.22)_inset] hover:-translate-y-0.5 hover:brightness-110"
        }`
      }
      disabled={followState.isLoading || toggleFollow.isPending}
      onClick={() => toggleFollow.mutate({ isFollowing })}
      type="button"
    >
      <UserPlus className="h-4 w-4" />
      {toggleFollow.isPending ? "Updating" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
