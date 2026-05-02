import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";

export type ContentLibraryUsageTerms =
  | string
  | string[]
  | Record<string, boolean | number | string | null>
  | null;

export interface ContentLibraryCreator {
  id: string;
  name: string | null;
  avatar_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
}

export interface ContentLibraryCampaign {
  id: string;
  title: string | null;
  campaign_type: string | null;
}

export interface ContentLibraryAssetRow {
  id: string;
  brand_id: string;
  creator_id: string | null;
  opportunity_id: string | null;
  asset_url: string;
  asset_type: string;
  creator: ContentLibraryCreator | null;
  campaign: ContentLibraryCampaign | null;
  market_tags: string[];
  product_category_tags: string[];
  platform_tags: string[];
  usage_terms: ContentLibraryUsageTerms;
  rights_expires_at: string | null;
  approval_status: string;
  created_at: string;
}

type ContentLibraryQueryResult = {
  data: ContentLibraryAssetRow[] | null;
  error: { message: string } | null;
};

type ContentLibraryQueryBuilder = {
  eq(column: "brand_id", value: string): {
    eq(column: "approval_status", value: string): {
      order(column: "created_at", options: { ascending: boolean }): Promise<ContentLibraryQueryResult>;
    };
  };
};

type ContentLibrarySupabase = {
  from(table: "content_library_assets"): {
    select(columns: string): ContentLibraryQueryBuilder;
  };
};

const contentLibrarySelect = `
  id,
  brand_id,
  creator_id,
  opportunity_id,
  asset_url,
  asset_type,
  market_tags,
  product_category_tags,
  platform_tags,
  usage_terms,
  rights_expires_at,
  approval_status,
  created_at,
  creator:users!content_library_assets_creator_id_fkey (
    id,
    name,
    avatar_url,
    instagram,
    tiktok,
    youtube
  ),
  campaign:opportunities!content_library_assets_opportunity_id_fkey (
    id,
    title,
    campaign_type
  )
`;

export function useContentLibrary() {
  const { brandContext, profile } = useAuth();
  const brandId = brandContext?.brandId ?? (profile?.user_type === "brand" ? profile.id : null);

  return useQuery<ContentLibraryAssetRow[]>({
    queryKey: ["content-library-assets", brandId],
    enabled: !!brandId,
    queryFn: async () => {
      if (!brandId) return [];

      const { data, error } = await (supabase as unknown as ContentLibrarySupabase)
        .from("content_library_assets")
        .select(contentLibrarySelect)
        .eq("brand_id", brandId)
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 30_000
  });
}
