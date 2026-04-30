"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import {
  Bookmark,
  ExternalLink,
  Heart,
  ImagePlus,
  Link2,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  Send,
  X
} from "lucide-react";
import {
  type FeedPostWithAuthor,
  type FeedMode,
  getFeedModeEmptyState,
  getFeedModeTabs,
  getPrimaryTrustBadge,
  uploadFeedMedia,
  useAuth,
  useCreateFeedPost,
  useFeedPosts
} from "@budcast/shared";
import { ProfileFollowButton } from "../profile-follow-button";
import { TrustBadge } from "../marketplace/trust-badge";
import { ProfileSafetyActions } from "../safety/profile-safety-actions";

type FeedViewer = {
  avatarFallback: string;
  avatarUrl?: string | null;
  displayName: string;
  handle: string;
};

type LinkPreview = {
  description: string;
  hostname: string;
  title: string;
  url: string;
};

export function BudCastSocialFeed({
  children,
  viewer
}: {
  children: ReactNode;
  viewer: FeedViewer;
}) {
  const [feedMode, setFeedMode] = useState<FeedMode>("all");
  const feed = useFeedPosts({ limit: 20, mode: feedMode });
  const [repostSource, setRepostSource] = useState<FeedPostWithAuthor | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const realPosts = feed.data ?? [];
  const hasRealPosts = realPosts.length > 0;
  const emptyState = getFeedModeEmptyState(feedMode);
  const showFallback = feedMode === "all" && !feed.isLoading && (!hasRealPosts || feed.isError);

  function openComposerForPost(post?: FeedPostWithAuthor) {
    setRepostSource(post ?? null);
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="relative grid gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {getFeedModeTabs().map((tab) => {
          const active = tab.mode === feedMode;
          return (
            <button
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black transition active:scale-95 ${
                active
                  ? "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.2),0_1px_0_rgba(255,255,255,0.2)_inset]"
                  : "border border-white/[0.075] bg-white/[0.04] text-[#c7ccc2] hover:border-[#b8ff3d]/22 hover:text-[#e7ff9a]"
              }`}
              key={tab.mode}
              onClick={() => setFeedMode(tab.mode)}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div ref={composerRef}>
        <FeedComposer
          onRepostCancel={() => setRepostSource(null)}
          repostSource={repostSource}
          viewer={viewer}
        />
      </div>

      {feed.isLoading ? (
        <div className="rounded-[28px] border border-white/[0.075] bg-white/[0.035] p-5 text-sm font-black text-[#c7ccc2]">
          Loading live BudCast posts...
        </div>
      ) : null}

      {feed.isError ? (
        <div className="rounded-[26px] border border-[#d7b46a]/20 bg-[#d7b46a]/[0.07] p-4 text-sm font-semibold leading-6 text-[#f0d28d]">
          Live feed posts are not available in this environment yet. Showing the launch-demo feed below.
        </div>
      ) : null}

      {!feed.isLoading && !feed.isError && !hasRealPosts ? (
        <div className="rounded-[26px] border border-white/[0.075] bg-white/[0.035] p-4 text-sm font-semibold leading-6 text-[#aeb5aa]">
          <p className="font-black text-[#fbfbf7]">{emptyState.title}</p>
          <p className="mt-1">{emptyState.body}</p>
        </div>
      ) : null}

      {hasRealPosts ? (
        <div className="grid gap-4">
          {realPosts.map((post) => (
            <FeedPostCard key={post.id} onRepost={() => openComposerForPost(post)} post={post} />
          ))}
        </div>
      ) : null}

      {showFallback ? <div className="grid gap-4">{children}</div> : null}

      <button
        aria-label="Create feed post"
        className="fixed bottom-24 right-[max(20px,calc((100vw-430px)/2+20px))] z-20 grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_18px_42px_rgba(184,255,61,0.28),0_10px_34px_rgba(0,0,0,0.45)] transition active:scale-95"
        onClick={() => openComposerForPost()}
        type="button"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

function FeedComposer({
  onRepostCancel,
  repostSource,
  viewer
}: {
  onRepostCancel: () => void;
  repostSource: FeedPostWithAuthor | null;
  viewer: FeedViewer;
}) {
  const { brandContext, profile } = useAuth();
  const createPost = useCreateFeedPost();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [linkValue, setLinkValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(Boolean(repostSource));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const linkPreview = useMemo(() => buildLinkPreview(linkValue), [linkValue]);
  const canSubmit = Boolean(body.trim() || files.length || linkPreview || repostSource);
  const isSubmitting = createPost.isPending || uploading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setError(null);
    setUploading(files.length > 0);

    try {
      const mediaUrls = [];
      const mediaOwnerId = brandContext?.brandId ?? profile?.id;
      for (const file of files) {
        mediaUrls.push(await uploadFeedMedia(file, mediaOwnerId));
      }

      await createPost.mutateAsync({
        body,
        mediaUrls,
        repostOfId: repostSource?.id,
        url: linkPreview?.url,
        urlDescription: linkPreview?.description,
        urlTitle: linkPreview?.title
      });

      setBody("");
      setFiles([]);
      setLinkValue("");
      setIsExpanded(false);
      onRepostCancel();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    setFiles(selectedFiles.slice(0, 4));
    setIsExpanded(true);
  }

  return (
    <form
      className="min-w-0 overflow-hidden rounded-[30px] border border-white/[0.075] bg-[radial-gradient(circle_at_16%_0%,rgba(184,255,61,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_48%),#0c0907] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.04)_inset]"
      onSubmit={handleSubmit}
    >
      <div className="flex gap-3">
        <div className="premium-icon-surface grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-black text-[#e7ff9a]">
          {viewer.avatarUrl ? <img alt="" className="h-full w-full object-cover" src={viewer.avatarUrl} /> : viewer.avatarFallback}
        </div>
        <div className="min-w-0 flex-1">
          <button
            className="w-full rounded-[22px] border border-white/[0.075] bg-white/[0.035] px-4 py-3 text-left text-sm font-bold text-[#aeb5aa] transition hover:border-[#b8ff3d]/20 hover:bg-white/[0.055]"
            onClick={() => setIsExpanded(true)}
            type="button"
          >
            Share an update, drop, proof, or link...
          </button>

          {isExpanded || repostSource ? (
            <div className="mt-3 grid gap-3">
              {repostSource ? (
                <RepostPreview onCancel={onRepostCancel} post={repostSource} />
              ) : null}
              <textarea
                className="min-h-28 resize-none rounded-[22px] border border-white/[0.075] bg-[#070806] px-4 py-3 text-sm font-semibold leading-6 text-[#fbfbf7] outline-none placeholder:text-[#83766e] focus:border-[#b8ff3d]/28"
                maxLength={2000}
                onChange={(event) => setBody(event.target.value)}
                placeholder={repostSource ? "Add a caption to this repost..." : "What should the BudCast network know?"}
                value={body}
              />
              <div className="flex items-center gap-2 rounded-[20px] border border-white/[0.075] bg-white/[0.035] px-3 py-2">
                <Link2 className="h-4 w-4 shrink-0 text-[#e7ff9a]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#fbfbf7] outline-none placeholder:text-[#83766e]"
                  onChange={(event) => setLinkValue(event.target.value)}
                  placeholder="Paste a product, campaign, store, or social URL"
                  value={linkValue}
                />
              </div>
              {linkPreview ? <LinkPreviewCard preview={linkPreview} /> : null}
              {files.length ? (
                <div className="grid gap-2">
                  {files.map((file) => (
                    <div
                      className="flex items-center justify-between rounded-[18px] border border-white/[0.075] bg-white/[0.035] px-3 py-2 text-xs font-black text-[#c7ccc2]"
                      key={`${file.name}-${file.size}`}
                    >
                      <span className="truncate">{file.name}</span>
                      <span className="ml-3 shrink-0 text-[#83766e]">{file.type.startsWith("video/") ? "Video" : "Image"}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {error ? <p className="text-sm font-bold leading-6 text-[#f0d28d]">{error}</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.075] pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <input
            accept="image/*,video/*"
            className="sr-only"
            multiple
            onChange={handleFiles}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/[0.045] px-3 text-xs font-black text-[#e7ff9a] transition hover:bg-white/[0.07]"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ImagePlus className="h-4 w-4" />
            Media
          </button>
          <button
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/[0.045] px-3 text-xs font-black text-[#c7ccc2] transition hover:bg-white/[0.07]"
            onClick={() => setIsExpanded(true)}
            type="button"
          >
            <Link2 className="h-4 w-4" />
            Link
          </button>
        </div>
        <button
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 text-xs font-black text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.18)] transition disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canSubmit || isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post
        </button>
      </div>
    </form>
  );
}

function FeedPostCard({ onRepost, post }: { onRepost: () => void; post: FeedPostWithAuthor }) {
  const author = getAuthorDisplay(post);
  const primaryBadge = post.author?.user_type
    ? getPrimaryTrustBadge({ badges: post.author.badges, profileType: post.author.user_type })
    : null;

  return (
    <article className="min-w-0 overflow-hidden rounded-[30px] border border-white/[0.075] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%),#0c0907] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex items-start gap-3">
        <div className="premium-icon-surface grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-black text-[#e7ff9a]">
          {author.avatarUrl ? <img alt="" className="h-full w-full object-cover" src={author.avatarUrl} /> : author.fallback}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <div className="truncate text-[15px] font-black text-[#fbfbf7]">{author.name}</div>
                {primaryBadge ? <TrustBadge badge={primaryBadge} size="micro" /> : null}
              </div>
              <div className="mt-0.5 truncate text-xs font-bold text-[#83766e]">
                @{author.handle} · {formatFeedTimestamp(post.created_at)}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <ProfileFollowButton
                className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border border-[#b8ff3d]/18 bg-[#b8ff3d]/10 px-3 text-[10px] font-black text-[#e7ff9a] transition hover:bg-[#b8ff3d]/14"
                profileId={post.author?.id}
              />
              <button
                aria-label="Post actions"
                className="grid h-8 w-8 place-items-center rounded-full text-[#83766e] transition hover:bg-white/[0.055] hover:text-[#fbfbf7]"
                type="button"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {post.body ? <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-[#d8ded1]">{post.body}</p> : null}
          {post.media_urls?.length ? <MediaGrid urls={post.media_urls} /> : null}
          {post.url ? (
            <LinkPreviewCard
              preview={{
                description: post.url_description || getHostname(post.url),
                hostname: getHostname(post.url),
                title: post.url_title || getHostname(post.url),
                url: post.url
              }}
            />
          ) : null}
          {post.repost ? <QuotedPost post={post.repost} /> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.075] pt-3">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto text-[#aeb5aa] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SocialPill icon={<MessageCircle className="h-4 w-4" />} label="0" />
              <button
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/[0.035] px-3 text-xs font-black transition hover:bg-white/[0.055] hover:text-[#fbfbf7]"
                onClick={onRepost}
                type="button"
              >
                <Repeat2 className="h-4 w-4" />
                Repost
              </button>
              <SocialPill icon={<Heart className="h-4 w-4" />} label="0" />
              <span className="hidden min-h-9 items-center rounded-full bg-white/[0.035] px-3 transition hover:bg-white/[0.055] hover:text-[#fbfbf7] sm:inline-flex">
                <Bookmark className="h-4 w-4" />
              </span>
            </div>
            <ProfileSafetyActions
              blockProfileId={post.author?.id}
              compact
              reportedUserId={post.author?.id}
              targetId={post.id}
              targetType="feed_post"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function MediaGrid({ urls }: { urls: string[] }) {
  return (
    <div className="mt-3 grid gap-2 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025] p-2">
      {urls.slice(0, 4).map((url) => {
        const isVideo = /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);
        return isVideo ? (
          <video className="max-h-[520px] w-full rounded-[18px] object-cover" controls key={url} src={url} />
        ) : (
          <img alt="" className="max-h-[520px] w-full rounded-[18px] object-cover" key={url} src={url} />
        );
      })}
    </div>
  );
}

function LinkPreviewCard({ preview }: { preview: LinkPreview }) {
  return (
    <a
      className="mt-3 block rounded-[24px] border border-[#b8ff3d]/14 bg-[linear-gradient(135deg,rgba(184,255,61,0.11),transparent_44%),#071007] p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition hover:border-[#b8ff3d]/28"
      href={preview.url}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">{preview.hostname}</div>
          <h4 className="mt-2 line-clamp-2 text-lg font-black leading-tight tracking-[-0.04em] text-[#fbfbf7]">
            {preview.title}
          </h4>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#aeb5aa]">{preview.description}</p>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-[#e7ff9a]" />
      </div>
    </a>
  );
}

function QuotedPost({ post }: { post: FeedPostWithAuthor["repost"] }) {
  if (!post) return null;
  const author = getAuthorDisplay(post);

  return (
    <div className="mt-3 rounded-[22px] border border-white/[0.075] bg-white/[0.035] p-3">
      <div className="text-xs font-black text-[#fbfbf7]">{author.name}</div>
      <div className="mt-0.5 text-xs font-bold text-[#83766e]">@{author.handle}</div>
      {post.body ? <p className="mt-2 line-clamp-4 text-sm font-medium leading-6 text-[#d8ded1]">{post.body}</p> : null}
      {post.url ? <div className="mt-2 text-xs font-black text-[#e7ff9a]">{getHostname(post.url)}</div> : null}
    </div>
  );
}

function RepostPreview({ onCancel, post }: { onCancel: () => void; post: FeedPostWithAuthor }) {
  const author = getAuthorDisplay(post);

  return (
    <div className="rounded-[22px] border border-[#b8ff3d]/16 bg-[#b8ff3d]/[0.06] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e7ff9a]">Reposting</div>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[#d8ded1]">
            {author.name}: {post.body || post.url_title || post.url || "Feed post"}
          </p>
        </div>
        <button
          aria-label="Cancel repost"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#c7ccc2] transition hover:bg-white/[0.07] hover:text-[#fbfbf7]"
          onClick={onCancel}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SocialPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/[0.035] px-3 text-xs font-black transition hover:bg-white/[0.055] hover:text-[#fbfbf7]">
      {icon}
      {label}
    </span>
  );
}

function buildLinkPreview(value: string): LinkPreview | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const hostname = url.hostname.replace(/^www\./, "");
    return {
      description: `Shared from ${hostname}. Rich metadata will appear here as BudCast expands link previews.`,
      hostname,
      title: `${hostname} link`,
      url: url.toString()
    };
  } catch {
    return null;
  }
}

function getAuthorDisplay(post: Pick<FeedPostWithAuthor, "author">) {
  const author = post.author;
  const name = author?.company_name || author?.name || "BudCast member";
  const handleSource = author?.instagram || author?.tiktok || author?.youtube || name;
  const handle = handleSource.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "budcast";

  return {
    avatarUrl: author?.avatar_url,
    fallback: getInitials(name) || "BC",
    handle,
    name
  };
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatFeedTimestamp(source?: string | null) {
  if (!source) return "Now";
  const time = new Date(source).getTime();
  if (Number.isNaN(time)) return "Now";

  const diff = Date.now() - time;
  const hour = 1000 * 60 * 60;
  const day = hour * 24;

  if (diff < hour) return "Now";
  if (diff < day) return `${Math.max(Math.floor(diff / hour), 1)}h`;
  if (diff < day * 7) return `${Math.max(Math.floor(diff / day), 1)}d`;
  return new Date(source).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "External link";
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "NOT_SIGNED_IN") return "Sign in again before posting to the feed.";
    if (error.message === "FEED_POST_BODY_TOO_LONG") return "Keep feed posts under 2,000 characters.";
    if (error.message === "FEED_POST_CONTENT_REQUIRED") return "Add text, media, a link, or a repost before publishing.";
    return error.message;
  }

  return "BudCast could not publish this post. Try again in a moment.";
}
