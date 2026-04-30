import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import type { FeedMode } from "../lib/feed";
import { supabase } from "../lib/supabase";
import type { Database, FeedPost, FeedPostType, FeedPostVisibility, User } from "../types/database";

export type FeedPostAuthorSummary = Pick<
  User,
  | "id"
  | "user_type"
  | "name"
  | "company_name"
  | "avatar_url"
  | "location"
  | "badges"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "niches"
  | "review_score"
  | "review_count"
>;

export type FeedRepostSource = FeedPost & {
  author: FeedPostAuthorSummary | null;
};

export type FeedPostWithAuthor = FeedPost & {
  author: FeedPostAuthorSummary | null;
  repost: FeedRepostSource | null;
};

export interface UseFeedPostsOptions {
  authorId?: string | null;
  enabled?: boolean;
  limit?: number;
  mode?: FeedMode;
}

export interface CreateFeedPostInput {
  body?: string | null;
  mediaUrls?: string[];
  postType?: FeedPostType;
  repostOfId?: string | null;
  url?: string | null;
  urlDescription?: string | null;
  urlImage?: string | null;
  urlTitle?: string | null;
  visibility?: FeedPostVisibility;
}

const feedAuthorSelect = `
  id, user_type, name, company_name, avatar_url, location,
  badges, instagram, tiktok, youtube, niches, review_score, review_count
`;

function cleanOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

function inferPostType(input: CreateFeedPostInput): FeedPostType {
  if (input.postType) return input.postType;
  if (input.repostOfId) return "repost";
  if (input.mediaUrls?.length) return "media";
  if (cleanOptionalText(input.url)) return "link";
  return "text";
}

function sanitizeFeedMediaName(fileName: string) {
  const fallback = "feed-media";
  const trimmed = fileName.trim().toLowerCase();
  const safeName = trimmed.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return safeName || fallback;
}

export function useFeedPosts(options: UseFeedPostsOptions = {}) {
  const { brandContext, profile } = useAuth();
  const currentProfileId = profile?.id ?? null;
  const effectiveAuthorId = brandContext?.brandId ?? currentProfileId;
  const authorId = options.authorId ?? null;
  const limit = options.limit ?? 50;
  const mode = options.mode ?? "all";

  return useQuery<FeedPostWithAuthor[]>({
    queryKey: ["feed-posts", { authorId, currentUserId: currentProfileId, effectiveAuthorId, limit, mode }],
    enabled: !!currentProfileId && (options.enabled ?? true),
    queryFn: async () => {
      let followedProfileIds: string[] | null = null;

      if (mode === "following") {
        const { data: follows, error: followsError } = await supabase
          .from("profile_follows")
          .select("following_id")
          .eq("follower_id", effectiveAuthorId!);

        if (followsError) throw followsError;

        followedProfileIds = (follows ?? []).map((follow) => follow.following_id);
        if (!followedProfileIds.length) return [];
      }

      let query = supabase
        .from("feed_posts")
        .select(
          `
          *,
          author:users!feed_posts_author_id_fkey (${feedAuthorSelect})
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (authorId) {
        query = query.eq("author_id", authorId);
      } else if (followedProfileIds) {
        query = query.in("author_id", followedProfileIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return ((data ?? []) as Array<FeedPost & { author: FeedPostAuthorSummary | null }>).map((post) => ({
        ...post,
        repost: null
      }));
    },
    staleTime: 10_000
  });
}

export function useCreateFeedPost() {
  const queryClient = useQueryClient();
  const { brandContext, profile } = useAuth();

  return useMutation<FeedPost, unknown, CreateFeedPostInput>({
    mutationFn: async (input) => {
      if (!profile?.id) throw new Error("NOT_SIGNED_IN");
      const authorId = brandContext?.brandId ?? profile.id;

      const body = cleanOptionalText(input.body);
      if (body && body.length > 2000) throw new Error("FEED_POST_BODY_TOO_LONG");

      const mediaUrls = input.mediaUrls?.filter((url) => url.trim()).map((url) => url.trim()) ?? [];
      const url = cleanOptionalText(input.url);
      const repostOfId = cleanOptionalText(input.repostOfId);
      if (!body && !mediaUrls.length && !url && !repostOfId) {
        throw new Error("FEED_POST_CONTENT_REQUIRED");
      }

      const payload = {
        author_id: authorId,
        body,
        media_urls: mediaUrls,
        post_type: inferPostType({ ...input, mediaUrls, repostOfId, url }),
        repost_of_id: repostOfId,
        url,
        url_description: cleanOptionalText(input.urlDescription),
        url_image: cleanOptionalText(input.urlImage),
        url_title: cleanOptionalText(input.urlTitle),
        visibility: input.visibility ?? "public"
      } satisfies Database["public"]["Tables"]["feed_posts"]["Insert"];

      const { data, error } = await supabase.from("feed_posts").insert(payload).select("*").single();
      if (error) throw error;
      return data as FeedPost;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    }
  });
}

export async function uploadFeedMedia(file: File, profileId?: string) {
  const resolvedProfileId = profileId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!resolvedProfileId) throw new Error("NOT_SIGNED_IN");

  const safeName = sanitizeFeedMediaName(file.name);
  const filePath = `${resolvedProfileId}/feed/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("portfolios").upload(filePath, file, {
    cacheControl: "3600",
    contentType: file.type || undefined
  });

  if (error) throw error;

  const { data } = supabase.storage.from("portfolios").getPublicUrl(filePath);
  return data.publicUrl;
}
