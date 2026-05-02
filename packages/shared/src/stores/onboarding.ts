import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getSyncStorage } from "../lib/storage";
import type { User, UserType } from "../types/database";

export type OnboardingUserType = 'creator' | 'brand';

export interface OnboardingState {
  userType: OnboardingUserType | null;
  // Common
  name: string;
  location: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  // Creator
  niches: string[];
  instagram: string;
  tiktok: string;
  youtube: string;
  facebook: string;
  linkedin: string;
  xProfile: string;
  portfolioImageUrls: string[];
  audienceAgeAttested: boolean;
  cannabisWillingness: 'unspecified' | 'yes' | 'limited' | 'no';
  creatorContentCategories: string[];
  creatorMarkets: string[];
  creatorAvailability: 'open' | 'limited' | 'unavailable';
  budtenderExperience: boolean;
  budtenderMarket: string;
  storeAffiliation: string;
  budtenderEducationExperience: boolean;
  budtenderEventExperience: boolean;
  samplingRecapAvailable: boolean;
  // Brand
  companyName: string;
  website: string;
  brandCategories: string[];

  setUserType: (t: OnboardingUserType) => void;
  setField: <K extends keyof Omit<OnboardingState, 'setUserType' | 'setField' | 'toggleNiche' | 'reset'>>(
    key: K,
    value: OnboardingState[K]
  ) => void;
  toggleNiche: (niche: string) => void;
  hydrateFromProfile: (profile: User | null) => void;
  reset: () => void;
}

type OnboardingData = Omit<OnboardingState, 'setUserType' | 'setField' | 'toggleNiche' | 'hydrateFromProfile' | 'reset'>;

const storage = createJSONStorage(() => getSyncStorage());

const initial: OnboardingData = {
  userType: null,
  name: '',
  location: '',
  bio: '',
  avatarUrl: '',
  coverUrl: '',
  niches: [],
  instagram: '',
  tiktok: '',
  youtube: '',
  facebook: '',
  linkedin: '',
  xProfile: '',
  portfolioImageUrls: [],
  audienceAgeAttested: false,
  cannabisWillingness: 'unspecified',
  creatorContentCategories: [],
  creatorMarkets: [],
  creatorAvailability: 'open',
  budtenderExperience: false,
  budtenderMarket: '',
  storeAffiliation: '',
  budtenderEducationExperience: false,
  budtenderEventExperience: false,
  samplingRecapAvailable: false,
  companyName: '',
  website: '',
  brandCategories: [],
};

function toOnboardingUserType(userType: UserType | null | undefined): OnboardingUserType | null {
  return userType === "creator" || userType === "brand" ? userType : null;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initial,
      setUserType: (t) => set({ userType: t }),
      setField: (key, value) => set({ [key]: value } as Partial<OnboardingState>),
      toggleNiche: (niche) => {
        const current = get().niches;
        set({
          niches: current.includes(niche)
            ? current.filter((n) => n !== niche)
            : [...current, niche],
        });
      },
      hydrateFromProfile: (profile) => {
        if (!profile) return;
        set({
          userType: toOnboardingUserType(profile.user_type),
          name: profile.name ?? "",
          location: profile.location ?? "",
          bio: profile.bio ?? "",
          avatarUrl: profile.avatar_url ?? "",
          coverUrl: profile.cover_url ?? "",
          niches: profile.niches ?? [],
          instagram: profile.instagram ?? "",
          tiktok: profile.tiktok ?? "",
          youtube: profile.youtube ?? "",
          facebook: profile.facebook ?? "",
          linkedin: profile.linkedin ?? "",
          xProfile: profile.x_profile ?? "",
          portfolioImageUrls: profile.portfolio_image_urls ?? [],
          audienceAgeAttested: profile.audience_age_attested ?? false,
          cannabisWillingness: profile.cannabis_willingness ?? 'unspecified',
          creatorContentCategories: profile.creator_content_categories ?? [],
          creatorMarkets: profile.creator_markets ?? [],
          creatorAvailability: profile.creator_availability ?? 'open',
          budtenderExperience: profile.budtender_experience ?? false,
          budtenderMarket: profile.budtender_market ?? "",
          storeAffiliation: profile.store_affiliation ?? "",
          budtenderEducationExperience: profile.budtender_education_experience ?? false,
          budtenderEventExperience: profile.budtender_event_experience ?? false,
          samplingRecapAvailable: profile.sampling_recap_available ?? false,
          companyName: profile.company_name ?? "",
          website: profile.website ?? "",
          brandCategories: []
        });
      },
      reset: () => set(initial),
    }),
    {
      name: "budcast-onboarding",
      storage
    }
  )
);
