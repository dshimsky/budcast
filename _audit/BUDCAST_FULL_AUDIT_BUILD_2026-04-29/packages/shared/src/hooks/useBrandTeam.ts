import { useEffect, useState } from "react";
import {
  canBrandTeamRole,
  getBrandTeamDisplayLine,
  getBrandTeamRoleLabel
} from "../lib/brand-team";
import type { BrandTeamMember, BrandTeamRole, User } from "../types/database";

export {
  canBrandTeamRole,
  getBrandTeamDisplayLine,
  getBrandTeamRoleLabel
};

export interface BrandContext {
  brandId: string;
  actorId: string;
  role: BrandTeamRole;
  isOfficialBrand: boolean;
}

interface BrandTeamState {
  membership: BrandTeamMember | null;
  brand: User | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
}

export interface UseBrandTeamResult extends BrandTeamState {
  brandContext: BrandContext | null;
}

export function buildBrandContext(
  profile: User | null,
  membership?: BrandTeamMember | null
): BrandContext | null {
  if (!profile) return null;

  if (profile.user_type === "brand") {
    return {
      brandId: profile.id,
      actorId: profile.id,
      role: "owner",
      isOfficialBrand: true
    };
  }

  if (profile.user_type !== "brand_team" || !membership || membership.status !== "active") {
    return null;
  }

  return {
    brandId: membership.brand_id,
    actorId: profile.id,
    role: membership.role,
    isOfficialBrand: false
  };
}

export function useBrandTeam(profile: User | null): UseBrandTeamResult {
  const shouldLoadBrandTeam = profile?.user_type === "brand_team";
  const [state, setState] = useState<BrandTeamState>({
    membership: null,
    brand: null,
    loading: false,
    loaded: false,
    error: null
  });

  useEffect(() => {
    let cancelled = false;
    const userId = profile?.id;

    if (!shouldLoadBrandTeam || !userId) {
      setState({
        membership: null,
        brand: null,
        loading: false,
        loaded: false,
        error: null
      });
      return () => {
        cancelled = true;
      };
    }

    setState((current) => ({
      ...current,
      loading: true,
      loaded: false,
      error: null
    }));

    async function loadBrandTeam() {
      try {
        const { supabase } = await import("../lib/supabase");
        const { data: membership, error: membershipError } = await supabase
          .from("brand_team_members")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (membershipError) throw membershipError;

        if (!membership) {
          if (!cancelled) {
            setState({
              membership: null,
              brand: null,
              loading: false,
              loaded: true,
              error: null
            });
          }
          return;
        }

        const { data: brand, error: brandError } = await supabase
          .from("users")
          .select("*")
          .eq("id", membership.brand_id)
          .eq("user_type", "brand")
          .single();

        if (brandError) throw brandError;

        if (!cancelled) {
          setState({
            membership,
            brand,
            loading: false,
            loaded: true,
            error: null
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "[BrandTeam] Failed to load brand team context:",
            error instanceof Error ? error.message : error
          );
          setState({
            membership: null,
            brand: null,
            loading: false,
            loaded: true,
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
      }
    }

    void loadBrandTeam();

    return () => {
      cancelled = true;
    };
  }, [profile?.id, shouldLoadBrandTeam]);

  return {
    ...state,
    loading: shouldLoadBrandTeam ? state.loading || !state.loaded : false,
    brandContext: buildBrandContext(profile, state.membership)
  };
}
