import type {
  CampaignCategory,
  ContentFormat,
  OpportunityDraftFormState
} from "../types/database";

export type CampaignTemplateCategory =
  | "product_education"
  | "budtender_education"
  | "event_recap"
  | "compliant_lifestyle_ugc"
  | "unboxing"
  | "retail_market_awareness"
  | "ambassador_content";

export type CampaignTemplateId =
  | "product-education"
  | "budtender-education"
  | "event-recap"
  | "compliant-lifestyle-ugc"
  | "unboxing"
  | "retail-market-awareness"
  | "ambassador-content";

export type CampaignTemplatePlatform =
  | "instagram"
  | "instagram_reels"
  | "instagram_stories"
  | "tiktok"
  | "youtube_shorts"
  | "retail_training"
  | "event_capture";

export type CampaignTemplateBriefFieldName =
  | "title"
  | "short_description"
  | "description"
  | "categories"
  | "product_description"
  | "content_types"
  | "brand_mention"
  | "required_hashtags"
  | "must_includes"
  | "off_limits"
  | "reference_image_urls"
  | "eligible_states"
  | "target_platforms"
  | "disclosure_tags"
  | "min_applicant_age";

export interface CampaignTemplateBriefField {
  field: CampaignTemplateBriefFieldName;
  label: string;
  guidance: string;
}

export interface CampaignTemplate {
  id: CampaignTemplateId;
  label: string;
  category: CampaignTemplateCategory;
  objective: string;
  deliverables: string[];
  recommendedPlatforms: CampaignTemplatePlatform[];
  complianceNotes: string[];
  defaultDisclosureText: string;
  suggestedBriefFields: CampaignTemplateBriefField[];
  draftDefaults: Partial<OpportunityDraftFormState>;
}

export type CampaignPreflightSeverity = "error" | "warning";

export type CampaignPreflightFindingCode =
  | "missing_disclosure"
  | "sale_language"
  | "health_claim"
  | "age_market_mismatch"
  | "platform_warning";

export interface CampaignPreflightFinding {
  code: CampaignPreflightFindingCode;
  severity: CampaignPreflightSeverity;
  message: string;
  matches?: string[];
}

export interface CampaignPreflightContext {
  creatorAge?: number | null;
  creatorState?: string | null;
  allowedStates?: string[];
}

export type CampaignPreflightDraft = Partial<
  Pick<
    OpportunityDraftFormState,
    | "title"
    | "short_description"
    | "description"
    | "product_description"
    | "content_types"
    | "brand_mention"
    | "required_hashtags"
    | "must_includes"
    | "off_limits"
    | "eligible_states"
    | "target_platforms"
    | "disclosure_tags"
    | "min_applicant_age"
  >
>;

export interface CampaignPreflightResult {
  ok: boolean;
  findings: CampaignPreflightFinding[];
}

const DEFAULT_DISCLOSURE = "#ad Must be visible in the caption or first story frame.";

const BASE_COMPLIANCE_NOTES = [
  "Require creators to be 21+ and located in an eligible market.",
  "Do not include purchase links, discount codes, price claims, or calls to buy.",
  "Do not make health, wellness, therapeutic, or impairment claims.",
  "Keep required disclosure visible and easy to understand."
];

const BASE_BRIEF_FIELDS: CampaignTemplateBriefField[] = [
  {
    field: "description",
    label: "Creator brief",
    guidance: "Explain the story, product context, and required talking points without sale or health claims."
  },
  {
    field: "must_includes",
    label: "Must include",
    guidance: "List required shots, copy points, disclosure placement, and brand mention."
  },
  {
    field: "off_limits",
    label: "Off limits",
    guidance: "List claims, scenes, words, and behaviors creators must avoid."
  },
  {
    field: "eligible_states",
    label: "Eligible states",
    guidance: "Limit applications and content to markets where the campaign may run."
  },
  {
    field: "disclosure_tags",
    label: "Disclosure tags",
    guidance: "Provide exact disclosure language such as #ad or Paid partnership."
  }
];

function templateDefaults(
  categories: CampaignCategory[],
  contentTypes: ContentFormat[],
  targetPlatforms: string[]
): Partial<OpportunityDraftFormState> {
  return {
    categories,
    content_types: contentTypes,
    target_platforms: targetPlatforms,
    disclosure_tags: ["#ad"],
    prohibited_content: [
      "no_health_claims",
      "no_sale_language",
      "no_minors",
      "no_driving",
      "no_undisclosed_use"
    ],
    min_applicant_age: 21
  };
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "product-education",
    label: "Product Education",
    category: "product_education",
    objective: "Help qualified adult audiences understand product format, intended experience context, and responsible-use guardrails.",
    deliverables: ["One educational short-form video", "Caption with disclosure and brand mention", "Three approved talking points"],
    recommendedPlatforms: ["instagram_reels", "instagram_stories", "youtube_shorts"],
    complianceNotes: [
      ...BASE_COMPLIANCE_NOTES,
      "Use factual product attributes only, such as format, flavor, terpene profile, or packaging details."
    ],
    defaultDisclosureText: DEFAULT_DISCLOSURE,
    suggestedBriefFields: [
      { field: "product_description", label: "Product details", guidance: "Describe format, flavor, size, and non-medical differentiators." },
      { field: "content_types", label: "Content format", guidance: "Choose the short-form deliverable the creator should produce." },
      ...BASE_BRIEF_FIELDS
    ],
    draftDefaults: templateDefaults(["flower", "pre_rolls", "edibles", "vapes"], ["ig_reel", "ig_story"], ["instagram"])
  },
  {
    id: "budtender-education",
    label: "Budtender Education",
    category: "budtender_education",
    objective: "Equip verified budtenders with compliant product knowledge they can translate into adult retail conversations.",
    deliverables: ["One training recap video or carousel", "Key learning summary", "Retail Q&A prompt list"],
    recommendedPlatforms: ["instagram_stories", "retail_training"],
    complianceNotes: [
      ...BASE_COMPLIANCE_NOTES,
      "Keep education focused on product facts and retail handling, not consumer medical outcomes."
    ],
    defaultDisclosureText: DEFAULT_DISCLOSURE,
    suggestedBriefFields: [
      { field: "must_includes", label: "Training points", guidance: "List facts budtenders should retain and repeat accurately." },
      { field: "brand_mention", label: "Brand mention", guidance: "Provide the exact handle or brand name to use." },
      ...BASE_BRIEF_FIELDS
    ],
    draftDefaults: templateDefaults(["flower", "pre_rolls", "vapes", "edibles"], ["ig_story"], ["instagram"])
  },
  {
    id: "event-recap",
    label: "Event Recap",
    category: "event_recap",
    objective: "Capture a compliant recap of an adult-only brand activation, sampling education, or retail event.",
    deliverables: ["One recap reel or short", "Five approved event photos or clips", "Caption with event context and disclosure"],
    recommendedPlatforms: ["instagram_reels", "instagram_stories", "event_capture"],
    complianceNotes: [
      ...BASE_COMPLIANCE_NOTES,
      "Show only age-gated event areas and avoid visible minors, public consumption, driving, or unsafe handling."
    ],
    defaultDisclosureText: DEFAULT_DISCLOSURE,
    suggestedBriefFields: [
      { field: "description", label: "Event brief", guidance: "Include date, location market, access requirements, and approved capture zones." },
      { field: "must_includes", label: "Event shots", guidance: "List booth, staff, education, packaging, and atmosphere shots to capture." },
      ...BASE_BRIEF_FIELDS
    ],
    draftDefaults: templateDefaults(["lifestyle"], ["ig_reel", "ig_story"], ["instagram"])
  },
  {
    id: "compliant-lifestyle-ugc",
    label: "Compliant Lifestyle UGC",
    category: "compliant_lifestyle_ugc",
    objective: "Create brand-safe lifestyle content that shows product adjacency without consumption, impairment, or purchase prompts.",
    deliverables: ["One lifestyle UGC video", "One still image set", "Caption with disclosure and approved brand message"],
    recommendedPlatforms: ["instagram", "instagram_reels", "tiktok"],
    complianceNotes: [
      ...BASE_COMPLIANCE_NOTES,
      "Lifestyle scenes should avoid public use, vehicles, minors, exaggerated effects, and risky activities."
    ],
    defaultDisclosureText: DEFAULT_DISCLOSURE,
    suggestedBriefFields: [
      { field: "categories", label: "Lifestyle category", guidance: "Choose the product or lifestyle category the creative should support." },
      { field: "reference_image_urls", label: "References", guidance: "Use form references for visual direction when available." },
      ...BASE_BRIEF_FIELDS
    ],
    draftDefaults: templateDefaults(["lifestyle", "accessories"], ["ig_reel", "tiktok_video"], ["instagram", "tiktok"])
  },
  {
    id: "unboxing",
    label: "Unboxing",
    category: "unboxing",
    objective: "Show adult creators opening compliant brand packaging and explaining what is included without encouraging purchase.",
    deliverables: ["One unboxing video", "Close-up packaging clips", "Caption with disclosure and non-commerce product context"],
    recommendedPlatforms: ["instagram_reels", "tiktok", "youtube_shorts"],
    complianceNotes: [
      ...BASE_COMPLIANCE_NOTES,
      "Avoid price, availability, shipping, ordering, or inventory language."
    ],
    defaultDisclosureText: DEFAULT_DISCLOSURE,
    suggestedBriefFields: [
      { field: "product_description", label: "Box contents", guidance: "List exactly what the creator may show and describe." },
      { field: "off_limits", label: "Packaging limits", guidance: "Call out labels, documents, or private details that should not be shown." },
      ...BASE_BRIEF_FIELDS
    ],
    draftDefaults: templateDefaults(["accessories", "lifestyle"], ["ig_reel", "tiktok_video", "youtube_short"], ["instagram", "tiktok", "youtube"])
  },
  {
    id: "retail-market-awareness",
    label: "Retail-Market Awareness",
    category: "retail_market_awareness",
    objective: "Build awareness that a brand is present in a legal market while avoiding purchase direction or dispensary sales language.",
    deliverables: ["One market awareness post or reel", "Market-specific caption", "Approved store or region mention if allowed"],
    recommendedPlatforms: ["instagram", "instagram_reels", "instagram_stories"],
    complianceNotes: [
      ...BASE_COMPLIANCE_NOTES,
      "Market awareness may mention a legal state or adult-use market but should not tell viewers where or how to buy."
    ],
    defaultDisclosureText: DEFAULT_DISCLOSURE,
    suggestedBriefFields: [
      { field: "eligible_states", label: "Target market", guidance: "Set the exact state markets this awareness campaign can reference." },
      { field: "short_description", label: "Market message", guidance: "Write a neutral awareness line with no purchase instruction." },
      ...BASE_BRIEF_FIELDS
    ],
    draftDefaults: templateDefaults(["lifestyle"], ["ig_post", "ig_reel", "ig_story"], ["instagram"])
  },
  {
    id: "ambassador-content",
    label: "Ambassador Content",
    category: "ambassador_content",
    objective: "Give trusted adult creators repeatable guardrails for ongoing brand storytelling and community education.",
    deliverables: ["Monthly creator post or short", "Approved brand mention", "Reusable caption and disclosure framework"],
    recommendedPlatforms: ["instagram", "instagram_reels", "tiktok", "youtube_shorts"],
    complianceNotes: [
      ...BASE_COMPLIANCE_NOTES,
      "Ambassador briefs should refresh disclosures on every deliverable and keep claims within approved brand language."
    ],
    defaultDisclosureText: DEFAULT_DISCLOSURE,
    suggestedBriefFields: [
      { field: "brand_mention", label: "Ambassador mention", guidance: "Provide the approved account tag and brand naming convention." },
      { field: "required_hashtags", label: "Required hashtags", guidance: "Include campaign hashtags only when they do not imply sale or medical benefit." },
      ...BASE_BRIEF_FIELDS
    ],
    draftDefaults: templateDefaults(["lifestyle"], ["ig_post", "ig_reel", "tiktok_video", "youtube_short"], ["instagram", "tiktok", "youtube"])
  }
];

const DISCLOSURE_PATTERNS = [
  /(^|\s)#ad(\s|$|[.,;:!?])/i,
  /(^|\s)#sponsored(\s|$|[.,;:!?])/i,
  /paid partnership/i,
  /sponsored by/i
];

const SALE_LANGUAGE_PATTERNS = [
  /\b\d{1,3}\s*%\s*off\b/i,
  /\bbuy\s+now\b/i,
  /\border\s+now\b/i,
  /\bshop\s+now\b/i,
  /\badd\s+to\s+cart\b/i,
  /\bpromo\s+code\b/i,
  /\bcoupon\b/i,
  /\bdiscount\b/i,
  /\bbogo\b/i,
  /\bfree\s+shipping\b/i,
  /\bdeal\b/i,
  /\bon\s+sale\b/i
];

const HEALTH_CLAIM_PATTERNS = [
  /\btreats?\b/i,
  /\bcures?\b/i,
  /\bheals?\b/i,
  /\btherapy\b/i,
  /\btherapeutic\b/i,
  /\bmedical\b/i,
  /\banxiety\b/i,
  /\bdepression\b/i,
  /\bptsd\b/i,
  /\bpain\b/i,
  /\binflammation\b/i,
  /\binsomnia\b/i,
  /\bsleep\s+(aid|support)\b/i,
  /\bnausea\b/i,
  /\bappetite\b/i,
  /\bcancer\b/i
];

const PLATFORM_WARNING_TEXT: Record<string, string> = {
  tiktok: "TikTok cannabis policies are restrictive. Confirm the creative avoids product sale, use, and claims before publishing.",
  youtube: "YouTube cannabis content can be age-restricted or limited. Keep educational framing and visible disclosure.",
  youtube_shorts: "YouTube Shorts cannabis content can be age-restricted or limited. Keep educational framing and visible disclosure.",
  instagram: "Instagram cannabis content should avoid sale, menu, ordering, consumption, and medical-claim framing.",
  facebook: "Facebook cannabis content should avoid sale, menu, ordering, consumption, and medical-claim framing."
};

function compactText(values: Array<string | string[] | number | null | undefined>) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string | number => value !== null && value !== undefined)
    .map((value) => String(value))
    .join(" ")
    .trim();
}

function normalizeState(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function findPatternMatches(text: string, patterns: RegExp[]) {
  return patterns.reduce<string[]>((matches, pattern) => {
    const match = text.match(pattern)?.[0]?.trim();
    if (match && !matches.includes(match)) matches.push(match);
    return matches;
  }, []);
}

function hasDisclosure(draft: CampaignPreflightDraft, text: string) {
  if (draft.disclosure_tags?.some((tag) => tag.trim())) return true;
  return DISCLOSURE_PATTERNS.some((pattern) => pattern.test(text));
}

export function runCampaignCompliancePreflight(
  draft: CampaignPreflightDraft,
  context: CampaignPreflightContext = {}
): CampaignPreflightResult {
  const text = compactText([
    draft.title,
    draft.short_description,
    draft.description,
    draft.product_description,
    draft.brand_mention,
    draft.required_hashtags,
    draft.must_includes,
    draft.off_limits,
    draft.disclosure_tags
  ]);
  const findings: CampaignPreflightFinding[] = [];

  if (!hasDisclosure(draft, text)) {
    findings.push({
      code: "missing_disclosure",
      severity: "error",
      message: "Add a clear disclosure such as #ad or Paid partnership before sending the brief to creators."
    });
  }

  const saleMatches = findPatternMatches(text, SALE_LANGUAGE_PATTERNS);
  if (saleMatches.length > 0) {
    findings.push({
      code: "sale_language",
      severity: "error",
      message: "Remove sale, discount, ordering, or shopping language from the campaign brief.",
      matches: saleMatches
    });
  }

  const healthMatches = findPatternMatches(text, HEALTH_CLAIM_PATTERNS);
  if (healthMatches.length > 0) {
    findings.push({
      code: "health_claim",
      severity: "error",
      message: "Remove health, medical, therapeutic, or wellness outcome claims from the campaign brief.",
      matches: healthMatches
    });
  }

  const minAge = draft.min_applicant_age ?? 21;
  const creatorAge = context.creatorAge ?? null;
  const creatorState = normalizeState(context.creatorState);
  const eligibleStates = (draft.eligible_states ?? context.allowedStates ?? []).map(normalizeState).filter(Boolean);
  const ageMismatch = creatorAge !== null && creatorAge < minAge;
  const marketMismatch = creatorState && eligibleStates.length > 0 && !eligibleStates.includes(creatorState);
  const campaignAgeMarketIncomplete = minAge < 21 || eligibleStates.length === 0;

  if (ageMismatch || marketMismatch || campaignAgeMarketIncomplete) {
    findings.push({
      code: "age_market_mismatch",
      severity: "error",
      message:
        "Confirm the campaign requires 21+ applicants and at least one eligible market before publishing."
    });
  }

  const platformMessages = (draft.target_platforms ?? [])
    .map((platform) => platform.trim().toLowerCase())
    .map((platform) => PLATFORM_WARNING_TEXT[platform])
    .filter((message): message is string => Boolean(message));

  for (const message of [...new Set(platformMessages)]) {
    findings.push({
      code: "platform_warning",
      severity: "warning",
      message
    });
  }

  return {
    ok: findings.every((finding) => finding.severity !== "error"),
    findings
  };
}

export const runCampaignPreflight = runCampaignCompliancePreflight;
