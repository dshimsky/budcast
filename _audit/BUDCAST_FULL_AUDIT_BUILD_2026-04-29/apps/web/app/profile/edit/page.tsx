"use client";

import Link from "next/link";
import { hasCompletedOnboarding, supabase, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Camera, Eye, Image as ImageIcon, Sparkles, Users2 } from "lucide-react";
import { BrandMobileBottomNav } from "../../../components/brand-mobile";
import { BudCastLogo } from "../../../components/budcast-logo";
import { CreatorBottomNav } from "../../../components/creator-social/creator-bottom-nav";
import { MediaGrid, SocialPlatformGrid, type MediaGridItem, type SocialPlatformItem } from "../../../components/marketplace";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { Button } from "../../../components/ui/button";

const creatorNiches = [
  "flower",
  "pre_rolls",
  "edibles",
  "vapes",
  "concentrates",
  "topicals",
  "accessories",
  "lifestyle"
] as const;

const brandKitAcceptedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const brandKitAcceptedExtensions = new Set(["png", "jpg", "jpeg", "webp", "svg"]);
const brandKitMaxBytes = 8 * 1024 * 1024;

function sanitizeAssetName(fileName: string) {
  const fallback = "brand-asset";
  const trimmed = fileName.trim().toLowerCase();
  const safeName = trimmed.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return safeName || fallback;
}

function isAllowedBrandKitFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return brandKitAcceptedTypes.has(file.type) || brandKitAcceptedExtensions.has(extension);
}

export default function EditProfilePage() {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [avatarFeedback, setAvatarFeedback] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [coverFeedback, setCoverFeedback] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [brandKitUploadFeedback, setBrandKitUploadFeedback] = useState<string | null>(null);
  const [isUploadingBrandKit, setIsUploadingBrandKit] = useState(false);
  const hydratedProfileId = useRef<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }
  }, [loading, profile, router, session]);

  useEffect(() => {
    if (!profile?.id || hydratedProfileId.current === profile.id) return;
    onboarding.hydrateFromProfile(profile);
    hydratedProfileId.current = profile.id;
  }, [onboarding, profile]);

  const isCreator = profile?.user_type === "creator";
	  const canSave = useMemo(() => {
	    if (!profile?.user_type) return false;
	    if (!onboarding.name.trim()) return false;
	    if (profile.user_type === "creator") return Boolean(onboarding.instagram.trim());
	    if (profile.user_type === "brand_team") return true;
	    return Boolean(onboarding.companyName.trim());
	  }, [onboarding.companyName, onboarding.instagram, onboarding.name, profile?.user_type]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing profile editing."
        description="BudCast is validating your account before opening profile edits."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Finish setup before editing details."
        description="Profile editing unlocks after onboarding so the right creator or brand surface is already established."
      />
    );
  }

  async function handleSave(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!profile?.user_type) return;
    try {
      setFeedback(null);
      await saveProfile.mutateAsync({ userType: profile.user_type });
      router.replace("/profile");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Profile save failed.");
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !profile?.id) return;

    if (!file.type.startsWith("image/")) {
      setAvatarFeedback("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarFeedback("Profile photos must be under 5MB.");
      return;
    }

    try {
      setAvatarFeedback(null);
      setIsUploadingAvatar(true);
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${profile.id}/avatar-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type
      });

      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onboarding.setField("avatarUrl", data.publicUrl);
      setAvatarFeedback("Profile photo uploaded. Save changes to publish it.");
    } catch (error) {
      setAvatarFeedback(error instanceof Error ? error.message : "Avatar upload failed.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !profile?.id) return;

    if (!file.type.startsWith("image/")) {
      setCoverFeedback("Please choose an image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setCoverFeedback("Cover images must be under 8MB.");
      return;
    }

    try {
      setCoverFeedback(null);
      setIsUploadingCover(true);
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${profile.id}/cover-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type
      });

      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onboarding.setField("coverUrl", data.publicUrl);
      setCoverFeedback("Cover image uploaded. Save changes to publish it.");
    } catch (error) {
      setCoverFeedback(error instanceof Error ? error.message : "Cover upload failed.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  const editingNotes = isCreator
    ? [
        "Brands use this profile to evaluate creator fit before acceptance.",
        "Clear niche and social identity reduces low-intent applications.",
        "The profile should look curated, not barely configured."
      ]
    : [
        "Creators use this profile to judge whether a campaign feels worth their effort.",
        "A weak brand profile erodes trust before a brief is even opened.",
        "Company context should feel considered, not boilerplate."
      ];
  const previewName = onboarding.name.trim() || (isCreator ? "Creator name" : "Brand owner");
  const previewLocation = onboarding.location.trim() || "Location not added";
  const previewHandle =
    onboarding.instagram.trim() || onboarding.tiktok.trim() || onboarding.youtube.trim() || "@creatorhandle";
  const previewBio =
    onboarding.bio.trim() ||
    (isCreator
      ? "Add a short creator bio that tells cannabis brands what you make, who you reach, and why you fit their campaigns."
      : "Add a short brand bio that helps creators understand your company, products, and campaign standards.");
  const previewNiches = onboarding.niches.length ? onboarding.niches : ["lifestyle"];
  const socialPreview: SocialPlatformItem[] = [
    { label: "Instagram", platform: "instagram", value: onboarding.instagram },
    { label: "TikTok", platform: "tiktok", value: onboarding.tiktok },
    { label: "YouTube", platform: "youtube", value: onboarding.youtube },
    { label: "Facebook", platform: "facebook", value: onboarding.facebook },
    { label: "LinkedIn", platform: "linkedin", value: onboarding.linkedin },
    { label: "X", platform: "x", value: onboarding.xProfile }
  ];
  const brandPreviewName = onboarding.companyName.trim() || "Brand name";
  const brandPreviewWebsite = onboarding.website.trim() || "Website not added";
  const brandExampleUrls = onboarding.portfolioImageUrls.filter((url) => url.trim()).slice(0, 3);
  const brandExampleItems: MediaGridItem[] = brandExampleUrls.length
    ? brandExampleUrls.map((imageUrl, index) => ({
        id: `${imageUrl}-${index}`,
        imageUrl,
        label: `Campaign example ${index + 1}`,
        type: "image"
      }))
    : [{ id: "brand-example-empty", label: "Add visual examples", type: "image" }];
  const profileHomeHref = isCreator ? "/creator-dashboard" : "/dashboard";
  const profileNameForNav = isCreator
    ? onboarding.name || profile?.name || profile?.email || "Creator"
    : onboarding.companyName || profile?.company_name || profile?.name || profile?.email || "Brand";

  function updatePortfolioUrl(index: number, value: string) {
    const next = [...onboarding.portfolioImageUrls];
    next[index] = value;
    onboarding.setField("portfolioImageUrls", next);
  }

  async function handleBrandKitAssetUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !profile?.id) return;

    const invalidFile = files.find((file) => !isAllowedBrandKitFile(file));
    if (invalidFile) {
      setBrandKitUploadFeedback("Use PNG, JPEG, WebP, or SVG files for Brand Kit assets.");
      return;
    }

    const oversizedFile = files.find((file) => file.size > brandKitMaxBytes);
    if (oversizedFile) {
      setBrandKitUploadFeedback("Brand Kit assets must be under 8MB each.");
      return;
    }

    try {
      setBrandKitUploadFeedback(null);
      setIsUploadingBrandKit(true);
      const uploadedUrls: string[] = [];

      for (const [index, file] of files.entries()) {
        const safeName = sanitizeAssetName(file.name);
        const filePath = `${profile.id}/brand-kit/${Date.now()}-${index}-${safeName}`;
        const { error } = await supabase.storage.from("portfolios").upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type || undefined
        });

        if (error) throw error;

        const { data } = supabase.storage.from("portfolios").getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      const existingUrls = onboarding.portfolioImageUrls.filter((url) => url.trim());
      onboarding.setField("portfolioImageUrls", [...existingUrls, ...uploadedUrls]);
      setBrandKitUploadFeedback(
        `${uploadedUrls.length} asset${uploadedUrls.length === 1 ? "" : "s"} uploaded. Save changes to publish the Brand Kit.`
      );
    } catch (error) {
      setBrandKitUploadFeedback(error instanceof Error ? error.message : "Brand Kit upload failed.");
    } finally {
      setIsUploadingBrandKit(false);
    }
  }

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-28 pt-5 text-[#fbfbf7] sm:px-6 md:px-10 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <EditPanel className="animate-enter overflow-hidden border-[#b8ff3d]/16 bg-[radial-gradient(circle_at_86%_0%,rgba(184,255,61,0.16),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.024))] p-4 md:p-6">
          <div className="rounded-[30px] border border-white/[0.085] bg-[linear-gradient(135deg,#16210f,#050604_68%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BudCastLogo className="brightness-125 contrast-[1.08]" href="/" size="md" variant="mark" />
                <div>
                  <div className="text-sm font-black leading-none text-[#fbfbf7]">BudCast</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#aeb5aa]">
                    {isCreator ? "Creator profile studio" : "Brand profile studio"}
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">
                <Button asChild className="flex-1 justify-center sm:flex-none" variant="secondary">
                  <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to profile
                  </Link>
                </Button>
                <Button asChild className="flex-1 justify-center sm:flex-none" variant="ghost">
                  <Link href={profileHomeHref}>{isCreator ? "Campaigns" : "Campaigns"}</Link>
                </Button>
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <EditEyebrow>{isCreator ? "Creator customization" : "Brand customization"}</EditEyebrow>
                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
                  Customize the profile the marketplace sees first.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
                  Shape the identity, social proof, visual examples, and trust signals that help people decide whether
                  to work with you.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/[0.1] bg-black/40 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.42),0_1px_0_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[24px] border border-white/[0.13] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(184,255,61,0.13))] text-xl font-black text-[#fbfbf7]">
                    {onboarding.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={onboarding.avatarUrl} />
                    ) : (
                      <Camera className="h-8 w-8 text-[#e7ff9a]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                      {isCreator ? previewName : brandPreviewName}
                    </div>
                    <div className="mt-1 truncate text-sm font-bold text-[#c7ccc2]">
                      {isCreator ? previewHandle : brandPreviewWebsite}
                    </div>
                    <div className="mt-3 inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">
                      {isCreator ? "Creator mode active" : "Brand mode active"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </EditPanel>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_320px]">
          <EditPanel className="p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.075] pb-6">
              <div className="max-w-3xl">
                <EditEyebrow>Profile fields</EditEyebrow>
                <div className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                  {isCreator ? "Creator identity and niche fit" : "Brand identity and credibility"}
                </div>
                <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">
                  Keep this concise and specific. Every field here saves through the same setup flow you already used.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.075] bg-white/[0.055] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#d8ded1]">
                {isCreator ? <Users2 className="h-4 w-4 text-[#e7ff9a]" /> : <BriefcaseBusiness className="h-4 w-4 text-[#e7ff9a]" />}
                {isCreator ? "Creator profile" : "Brand profile"}
              </div>
            </div>

            <form className="mt-7 grid gap-5 md:grid-cols-2" onSubmit={handleSave}>
              <div className="md:col-span-2">
                <EditorSectionTitle
                  copy={
                    isCreator
                      ? "Your photo is the first trust signal brands see beside applications and messages."
                      : "Your logo or brand image is the first trust signal creators see beside campaigns and messages."
                  }
                  icon={<Camera className="h-4 w-4" />}
                  title="Visual identity"
                />
                <div className="rounded-[28px] border border-white/[0.075] bg-black/25 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.22),0_1px_0_rgba(255,255,255,0.035)_inset]">
                  <div
                    className="mb-5 flex min-h-40 items-end justify-between gap-3 overflow-hidden rounded-[28px] border border-white/[0.09] bg-[radial-gradient(circle_at_85%_18%,rgba(184,255,61,0.28),transparent_24%),linear-gradient(135deg,#344422,#10180b_52%,#050604)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    style={
                      onboarding.coverUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.55)), url(${onboarding.coverUrl})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover"
                          }
                        : undefined
                    }
                  >
                    <span className="rounded-full border border-white/[0.14] bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#eef7df] backdrop-blur-xl">
                      {isCreator ? "Creator cover" : "Brand cover"}
                    </span>
                    <label className="inline-flex h-10 cursor-pointer items-center rounded-full border border-[#e7ff9a]/18 bg-[#b8ff3d]/14 px-4 text-xs font-black text-[#e7ff9a] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#b8ff3d]/20">
                      {isUploadingCover ? "Uploading..." : "Upload cover"}
                      <input
                        accept="image/*"
                        className="sr-only"
                        disabled={isUploadingCover}
                        onChange={handleCoverUpload}
                        type="file"
                      />
                    </label>
                  </div>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/[0.065] bg-white/[0.035] p-4">
                    <div>
                      <div className="text-sm font-black text-[#fbfbf7]">Profile cover</div>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#aeb5aa]">
                        This appears at the top of your public profile. Keep it visual and uncluttered.
                      </p>
                    </div>
                    {onboarding.coverUrl ? (
                      <button
                        className="h-10 rounded-full px-4 text-xs font-black text-[#d8ded1] transition hover:bg-white/[0.06] hover:text-[#fbfbf7]"
                        onClick={() => {
                          onboarding.setField("coverUrl", "");
                          setCoverFeedback("Cover image removed. Save changes to publish it.");
                        }}
                        type="button"
                      >
                        Remove cover
                      </button>
                    ) : null}
                    {coverFeedback ? (
                      <p className="basis-full text-xs font-bold leading-5 text-[#d8ded1]" role="status">
                        {coverFeedback}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="premium-icon-surface h-24 w-24 overflow-hidden rounded-[30px]">
                      {onboarding.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-cover" src={onboarding.avatarUrl} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Camera className="h-8 w-8 text-[#e7ff9a]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-[#fbfbf7]">Profile photo</div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c7ccc2]">
                        {isCreator
                          ? "Upload the photo cannabis brands will see beside your campaign applications."
                          : "Upload the logo or brand image creators will see beside your campaigns."}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#e7ff9a]/20 bg-[#b8ff3d]/12 px-5 text-sm font-black text-[#e7ff9a] transition hover:-translate-y-0.5 hover:bg-[#b8ff3d]/18">
                          {isUploadingAvatar ? "Uploading..." : "Upload photo"}
                          <input
                            accept="image/*"
                            className="sr-only"
                            disabled={isUploadingAvatar}
                            onChange={handleAvatarUpload}
                            type="file"
                          />
                        </label>
                        {onboarding.avatarUrl ? (
                          <button
                            className="h-11 rounded-full px-4 text-sm font-black text-[#c7ccc2] transition hover:bg-white/[0.06] hover:text-[#fbfbf7]"
                            onClick={() => {
                              onboarding.setField("avatarUrl", "");
                              setAvatarFeedback("Profile photo removed. Save changes to publish it.");
                            }}
                            type="button"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      {avatarFeedback ? (
                        <p className="mt-3 text-sm text-[#d8ded1]" role="status">
                          {avatarFeedback}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <EditorSectionTitle
                  copy="Keep the core profile details clear, scannable, and specific to the cannabis creator marketplace."
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Public story"
                />
              </div>

              <label className="text-sm font-black text-[#fbfbf7]">
                {isCreator ? "Display name" : "Owner name"}
                <input
                  className="premium-input mt-2"
                  onChange={(event) => onboarding.setField("name", event.target.value)}
                  value={onboarding.name}
                />
              </label>
              <label className="text-sm font-black text-[#fbfbf7]">
                Location
                <input
                  className="premium-input mt-2"
                  onChange={(event) => onboarding.setField("location", event.target.value)}
                  value={onboarding.location}
                />
              </label>
              <label className="text-sm font-black text-[#fbfbf7] md:col-span-2">
                Bio
                <textarea
                  className="premium-textarea mt-2"
                  onChange={(event) => onboarding.setField("bio", event.target.value)}
                  value={onboarding.bio}
                />
              </label>

              {isCreator ? (
                <>
                  <div className="md:col-span-2">
                    <EditorSectionTitle
                      copy="These appear as platform chips on your profile so brands can quickly understand your creator presence."
                      icon={<Users2 className="h-4 w-4" />}
                      title="Connected channels"
                    />
                  </div>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    Instagram
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("instagram", event.target.value)}
                      value={onboarding.instagram}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    TikTok
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("tiktok", event.target.value)}
                      value={onboarding.tiktok}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7] md:col-span-2">
                    YouTube
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("youtube", event.target.value)}
                      value={onboarding.youtube}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    Facebook
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("facebook", event.target.value)}
                      value={onboarding.facebook}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    LinkedIn
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("linkedin", event.target.value)}
                      value={onboarding.linkedin}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7] md:col-span-2">
                    X
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("xProfile", event.target.value)}
                      value={onboarding.xProfile}
                    />
                  </label>
                  <div className="md:col-span-2">
                    <EditorSectionTitle
                      copy="Niches help brands judge fit before they open your profile or application."
                      icon={<Eye className="h-4 w-4" />}
                      title="Campaign fit"
                    />
                    <div className="text-sm font-black text-[#fbfbf7]">Niches</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {creatorNiches.map((niche) => {
                        const selected = onboarding.niches.includes(niche);
                        return (
                          <button
                            aria-pressed={selected}
                            className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
                              selected
                                ? "border-[#b8ff3d]/30 bg-[#b8ff3d]/14 text-[#e7ff9a] shadow-[0_14px_30px_rgba(184,255,61,0.14)]"
                                : "border-white/[0.075] bg-white/[0.04] text-[#d8ded1] hover:-translate-y-0.5 hover:bg-white/[0.06]"
                            }`}
                            key={niche}
                            onClick={() => onboarding.toggleNiche(niche)}
                            type="button"
                          >
                            {niche.replace("_", " ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-2">
                    <EditorSectionTitle
                      copy="These details shape the trust layer creators see before applying to a campaign."
                      icon={<BriefcaseBusiness className="h-4 w-4" />}
                      title="Brand basics"
                    />
                  </div>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    Brand name
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("companyName", event.target.value)}
                      value={onboarding.companyName}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    Website
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("website", event.target.value)}
                      value={onboarding.website}
                    />
                  </label>
                  <div className="md:col-span-2">
                    <EditorSectionTitle
                      copy="Social channels should feel like a verified public footprint, not hidden account settings."
                      icon={<Users2 className="h-4 w-4" />}
                      title="Connected channels"
                    />
                  </div>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    Instagram
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("instagram", event.target.value)}
                      placeholder="@brand"
                      value={onboarding.instagram}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    TikTok
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("tiktok", event.target.value)}
                      placeholder="@brand"
                      value={onboarding.tiktok}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7] md:col-span-2">
                    YouTube
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("youtube", event.target.value)}
                      placeholder="@brand or channel URL"
                      value={onboarding.youtube}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    Facebook
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("facebook", event.target.value)}
                      placeholder="facebook.com/brand"
                      value={onboarding.facebook}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7]">
                    LinkedIn
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("linkedin", event.target.value)}
                      placeholder="linkedin.com/company/brand"
                      value={onboarding.linkedin}
                    />
                  </label>
                  <label className="text-sm font-black text-[#fbfbf7] md:col-span-2">
                    X
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("xProfile", event.target.value)}
                      placeholder="@brand"
                      value={onboarding.xProfile}
                    />
                  </label>
                  <div className="md:col-span-2">
                    <EditorSectionTitle
                      copy="Category signals help creators understand audience fit before they apply."
                      icon={<Eye className="h-4 w-4" />}
                      title="Campaign fit"
                    />
                    <div className="text-sm font-black text-[#fbfbf7]">Brand category signals</div>
                    <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                      These help creators decide whether their audience fits your campaigns.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {creatorNiches.map((niche) => {
                        const selected = onboarding.niches.includes(niche);
                        return (
                          <button
                            aria-pressed={selected}
                            className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
                              selected
                                ? "border-[#b8ff3d]/30 bg-[#b8ff3d]/14 text-[#e7ff9a] shadow-[0_14px_30px_rgba(184,255,61,0.14)]"
                                : "border-white/[0.075] bg-white/[0.04] text-[#d8ded1] hover:-translate-y-0.5 hover:bg-white/[0.06]"
                            }`}
                            key={niche}
                            onClick={() => onboarding.toggleNiche(niche)}
                            type="button"
                          >
                            {niche.replace("_", " ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <EditorSectionTitle
                      copy="Store reusable logos, product visuals, packaging shots, and approved examples that can later be attached to campaign briefs."
                      icon={<ImageIcon className="h-4 w-4" />}
                      title="Brand Kit"
                    />
                    <div className="text-sm font-black text-[#fbfbf7]">Brand asset URLs</div>
                    <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                      Add image URLs for logos, product photos, packaging, completed campaign examples, or approved creator reference visuals. BudCast renders them inside the brand profile.
                    </p>
                    <div className="mt-3 rounded-[26px] border border-white/[0.075] bg-black/25 p-3 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-black text-[#fbfbf7]">Upload brand assets</div>
                          <p className="mt-1 text-xs font-semibold leading-5 text-[#aeb5aa]">
                            PNG, JPEG, WebP, and SVG files upload into the existing Brand Kit library.
                          </p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#b8ff3d] px-5 py-3 text-sm font-black text-black shadow-[0_18px_45px_rgba(184,255,61,0.18)] transition hover:-translate-y-0.5 hover:bg-[#d9ff75]">
                          {isUploadingBrandKit ? "Uploading..." : "Upload files"}
                          <input
                            accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                            className="sr-only"
                            disabled={isUploadingBrandKit}
                            multiple
                            onChange={handleBrandKitAssetUpload}
                            type="file"
                          />
                        </label>
                      </div>
                      {brandKitUploadFeedback ? (
                        <p className="mt-3 text-xs font-bold leading-5 text-[#d8ded1]" role="status">
                          {brandKitUploadFeedback}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                      <div className="grid gap-3">
                        {[0, 1, 2].map((index) => (
                          <input
                            className="premium-input"
                            key={index}
                            onChange={(event) => updatePortfolioUrl(index, event.target.value)}
                            placeholder={`Brand kit image URL ${index + 1}`}
                            value={onboarding.portfolioImageUrls[index] ?? ""}
                          />
                        ))}
                      </div>
                      <div className="rounded-[24px] border border-white/[0.075] bg-black/25 p-3 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">Brand kit preview</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7d7068]">No external click</span>
                        </div>
                        <MediaGrid className="grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1" items={brandExampleItems} />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 md:col-span-2">
                <Button disabled={!canSave || saveProfile.isPending} size="lg" type="submit">
                  {saveProfile.isPending ? "Saving..." : "Save changes"}
                  {!saveProfile.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                </Button>
                {feedback ? (
                  <p className="text-sm text-red-200" role="alert">
                    {feedback}
                  </p>
                ) : null}
              </div>
            </form>

          </EditPanel>

          <div className="grid gap-6">
            <EditPanel className="p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#e7ff9a]" />
                <div>
                  <EditEyebrow>Editing intent</EditEyebrow>
                  <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">What this screen should optimize for</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {editingNotes.map((item, index) => (
                  <div className="rounded-[20px] border border-white/[0.065] bg-black/25 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]" key={item}>
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d7068]">Note 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-7 text-[#d8ded1]">{item}</div>
                  </div>
                ))}
              </div>
            </EditPanel>

            <EditPanel className="p-5">
              <EditEyebrow>Live preview</EditEyebrow>
              <div className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                {isCreator ? "Marketplace profile preview" : "Brand profile preview"}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                This is the profile context reviewers see before accepting campaign work.
              </p>
              <div className="mt-5 overflow-hidden rounded-[28px] border border-white/[0.075] bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div
                  className="flex min-h-32 items-end justify-end bg-[radial-gradient(circle_at_84%_28%,rgba(184,255,61,0.28),transparent_22%),linear-gradient(135deg,#344422,#10180b_52%,#050604)] p-4"
                  style={
                    onboarding.coverUrl
                      ? {
                          backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.03),rgba(0,0,0,0.58)), url(${onboarding.coverUrl})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover"
                        }
                      : undefined
                  }
                >
                  <span className="rounded-full border border-white/[0.14] bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#eef7df] backdrop-blur-xl">
                    {isCreator ? "Creator cover" : "Brand cover"}
                  </span>
                </div>
                <div className="border-b border-white/[0.065] bg-[radial-gradient(circle_at_20%_0%,rgba(184,255,61,0.1),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] p-5">
                  <div className="flex items-start gap-4">
                    <div className="premium-icon-surface h-20 w-20 shrink-0 overflow-hidden rounded-[26px]">
                      {onboarding.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full object-cover" src={onboarding.avatarUrl} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Camera className="h-7 w-7 text-[#e7ff9a]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">
                        {isCreator ? "Creator profile" : "Brand profile"}
                      </div>
                      <div className="mt-2 truncate text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                        {isCreator ? previewName : brandPreviewName}
                      </div>
                      <div className="mt-2 text-sm text-[#d8ded1]">
                        {isCreator ? previewHandle : previewName} · {previewLocation}
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#d8ded1]">{previewBio}</p>
                </div>

                <div className="grid gap-4 p-5">
                  {isCreator ? (
                    <>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d7068]">Niche fit</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {previewNiches.map((niche) => (
                            <span
                              className="rounded-full border border-[#b8ff3d]/25 bg-[#b8ff3d]/10 px-3 py-1.5 text-xs font-black text-[#e7ff9a]"
                              key={niche}
                            >
                              {niche.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d7068]">Social proof</div>
                        <SocialPlatformGrid className="mt-3 grid-cols-1" items={socialPreview} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-white/[0.065] bg-white/[0.03] p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d7068]">Brand details</div>
                        <div className="mt-3 text-lg font-black text-[#fbfbf7]">{brandPreviewName}</div>
                        <div className="mt-1 text-sm text-[#c7ccc2]">{brandPreviewWebsite}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d7068]">Social profiles</div>
                        <SocialPlatformGrid className="mt-3 grid-cols-1" items={socialPreview} />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d7068]">
                          Completed examples
                        </div>
                        <MediaGrid className="mt-3 grid-cols-1 gap-2" items={brandExampleItems} />
                      </div>
                    </>
                  )}

                  <div className="rounded-2xl border border-[#b8ff3d]/18 bg-[#b8ff3d]/[0.07] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">Profile strength</div>
                    <div className="mt-2 text-sm leading-6 text-[#d8ded1]">
                      {isCreator
                        ? "Add a profile photo, TikTok, and portfolio examples to improve campaign visibility."
                        : "Add company context, website, and campaign standards to help creators trust the brief."}
                    </div>
                  </div>
                </div>
              </div>
            </EditPanel>
          </div>
        </section>
      </div>
      {isCreator ? (
        <CreatorBottomNav
          items={[
            { href: "/creator-dashboard", label: "Campaigns" },
            { href: "/creator-dashboard/feed", label: "Feed" },
            { href: "/creator-dashboard/messages", label: "Messages" },
            { href: "/creator-dashboard/work", label: "Work" },
            {
              active: true,
              avatarFallback: getInitials(profileNameForNav),
              avatarUrl: onboarding.avatarUrl || profile?.avatar_url,
              href: "/profile",
              label: "Profile"
            }
          ]}
        />
      ) : (
        <BrandMobileBottomNav
          activeTab="Profile"
          avatarFallback={getInitials(profileNameForNav)}
          avatarUrl={onboarding.avatarUrl || profile?.avatar_url}
          items={[
            { href: "/dashboard", label: "Campaigns" },
            { href: "/dashboard/feed", label: "Feed" },
            { href: "/dashboard/messages", label: "Messages" },
            { href: "/dashboard/review", label: "Review" },
            {
              avatarFallback: getInitials(profileNameForNav),
              avatarUrl: onboarding.avatarUrl || profile?.avatar_url,
              href: "/profile",
              label: "Profile"
            }
          ]}
        />
      )}
    </main>
  );
}

function EditPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[30px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] shadow-[0_24px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function EditEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7ff9a]">{children}</p>;
}

function EditorSectionTitle({ copy, icon, title }: { copy: string; icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-[#b8ff3d]/18 bg-[#b8ff3d]/10 text-[#e7ff9a]">
          {icon}
        </div>
        <div>
          <div className="text-base font-black tracking-[-0.02em] text-[#fbfbf7]">{title}</div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#c7ccc2]">{copy}</p>
        </div>
      </div>
    </div>
  );
}

function getInitials(value: string) {
  const parts = value
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : value.slice(0, 2);
  return initials.toUpperCase();
}
