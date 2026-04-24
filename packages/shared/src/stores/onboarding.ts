import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getSyncStorage } from "../lib/storage";
import type { User } from "../types/database";

export type OnboardingUserType = 'creator' | 'brand';

export interface OnboardingState {
  userType: OnboardingUserType | null;
  // Common
  name: string;
  location: string;
  bio: string;
  // Creator
  niches: string[];
  instagram: string;
  tiktok: string;
  youtube: string;
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

const storage = createJSONStorage(() => getSyncStorage());

const initial = {
  userType: null,
  name: '',
  location: '',
  bio: '',
  niches: [],
  instagram: '',
  tiktok: '',
  youtube: '',
  companyName: '',
  website: '',
  brandCategories: [],
};

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
          userType: profile.user_type ?? null,
          name: profile.name ?? "",
          location: profile.location ?? "",
          bio: profile.bio ?? "",
          niches: profile.niches ?? [],
          instagram: profile.instagram ?? "",
          tiktok: profile.tiktok ?? "",
          youtube: profile.youtube ?? "",
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
