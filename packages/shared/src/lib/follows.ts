import type { UserType } from "../types/database";

export type ProfileFollowStatsLabelInput = {
  brandFollowers: number;
  creatorFollowers: number;
  followingCount: number;
  profileType: UserType;
  totalFollowers: number;
};

export function getProfileFollowStatsLabels(input: ProfileFollowStatsLabelInput) {
  if (input.profileType === "creator") {
    return [
      { label: "Brands following", value: formatFollowCount(input.brandFollowers) },
      { label: "Creator followers", value: formatFollowCount(input.creatorFollowers) },
      { label: "Following", value: formatFollowCount(input.followingCount) }
    ];
  }

  return [
    { label: "Followers", value: formatFollowCount(input.totalFollowers) },
    { label: "Following", value: formatFollowCount(input.followingCount) }
  ];
}

function formatFollowCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(value);
}
