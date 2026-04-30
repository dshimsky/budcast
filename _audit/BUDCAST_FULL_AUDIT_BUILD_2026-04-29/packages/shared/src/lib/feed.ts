export type FeedMode = "all" | "following";

export function getFeedModeTabs(): Array<{ label: string; mode: FeedMode }> {
  return [
    { label: "For You", mode: "all" },
    { label: "Following", mode: "following" }
  ];
}

export function getFeedModeEmptyState(mode: FeedMode) {
  if (mode === "following") {
    return {
      body: "Follow creators and brands to build a feed around the accounts you care about.",
      title: "Your following feed is ready."
    };
  }

  return {
    body: "Showing BudCast launch-demo posts until the first real post is published.",
    title: "The live feed is ready."
  };
}
