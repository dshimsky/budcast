/**
 * Campaign creation form store.
 *
 * Single source of truth for the in-progress campaign form across all
 * 6 steps. Pure state — no side effects, no Supabase calls. The autosave
 * hook subscribes to this store and persists changes; the publish action
 * reads from it to write the final opportunities row.
 *
 * Why Zustand (not React Context): the live preview pane on the right
 * column re-renders on EVERY keystroke. Context would force a full subtree
 * re-render. Zustand lets each consumer subscribe to just the slices it
 * needs, so the preview card only re-paints when title/image/etc actually
 * change — not when the brand is mid-typing in the brief textarea.
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  CampaignType,
  ContentFormat,
  PaymentMethod,
  CampaignCategory,
  ApprovalMode,
  OpportunityDraftFormState,
} from "../types/database";

// Credit cost per campaign type — locked per Decision Log #4.
export const CREDIT_COST_BY_TYPE: Record<CampaignType, number> = {
  gifting: 50,
  paid: 100,
  hybrid: 75,
};

// 6 steps in the flow. Step 1 (type picker) is the entry gate; steps 2-6
// use the 3-column shell.
export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;
export const STEP_NAMES: Record<StepNumber, string> = {
  1: 'Type',
  2: 'Basics',
  3: 'Compensation',
  4: 'Creative brief',
  5: 'Slots & timing',
  6: 'Review & publish',
};

export interface CampaignFormState extends OpportunityDraftFormState {
  // Tracking metadata — not persisted to opportunities, but lives in
  // opportunity_drafts.form_state alongside the form fields so the
  // autosave round-trip is symmetric.
  current_step: StepNumber;
  draft_id: string | null;
  last_saved_at: number | null;
  // Brand's available credits at the time this draft was loaded — used
  // to compute "balance after publish" without a fresh DB read on every
  // keystroke. Refreshed when the form is hydrated from the dashboard.
  brand_credits_balance: number;
}

const DEFAULT_APPLICATION_DEADLINE_DAYS_OUT = 7;
const DEFAULT_APPLICATION_DEADLINE_HOUR = 17;

interface CampaignFormActions {
  // Generic field setter — the form fields are loose JSONB on the way to
  // Supabase, so we accept partial updates that get shallow-merged in.
  patch: (changes: Partial<OpportunityDraftFormState>) => void;
  // Step nav — advances the current_step pointer. Components call this
  // when the brand clicks Continue. The router pushes the URL separately.
  setStep: (step: StepNumber) => void;
  // Toggle helpers for the chip-style multi-select fields. Avoids the
  // boilerplate of writing the same "if includes, remove, else append"
  // dance in every chip-group component.
  toggleCategory: (cat: CampaignCategory) => void;
  toggleContentFormat: (fmt: ContentFormat) => void;
  togglePaymentMethod: (m: PaymentMethod) => void;
  // Hashtag list ops. Hashtags get normalized to start with '#' and
  // trimmed/lowercased for consistency.
  addHashtag: (tag: string) => void;
  removeHashtag: (tag: string) => void;
  // Bullet list ops for must_includes + off_limits.
  addBullet: (field: 'must_includes' | 'off_limits', text?: string) => void;
  removeBullet: (field: 'must_includes' | 'off_limits', index: number) => void;
  updateBullet: (
    field: 'must_includes' | 'off_limits',
    index: number,
    text: string
  ) => void;
  // Hydrate from a saved draft (when brand resumes) or reset to a fresh
  // draft (when brand starts new). Clears the entire store either way.
  hydrate: (
    draft: { id: string; form_state: OpportunityDraftFormState; current_step: number } | null,
    brandCreditsBalance: number
  ) => void;
  // Called by the autosave hook after a successful upsert. Updates the
  // draft_id (in case this was the first save) and the timestamp.
  markSaved: (draftId: string) => void;
  // Reset to defaults — used after publish to clear the form.
  reset: () => void;
}

const INITIAL_STATE: CampaignFormState = {
  current_step: 1,
  draft_id: null,
  last_saved_at: null,
  brand_credits_balance: 0,
  // Form fields — all undefined until the brand fills them in.
  campaign_type: undefined,
  title: undefined,
  short_description: undefined,
  description: undefined,
  image_url: undefined,
  categories: [],
  cash_amount: undefined,
  product_description: undefined,
  payment_methods: [],
  content_types: [],
  brand_mention: undefined,
  required_hashtags: [],
  must_includes: [],
  off_limits: [],
  reference_image_urls: [],
  slots_available: 1,
  application_deadline: undefined,
  approval_mode: 'manual',
  // Rights defaults (migration 028)
  rights_organic_repost: true,
  rights_paid_ads: false,
  rights_whitelisting: false,
  rights_handle_licensing: false,
  rights_duration_days: null,
  rights_territory: 'US',
  rights_exclusive: false,
  rights_exclusivity_days: null,
  rights_no_ai_training: true,
  rights_revocable: false,
  rights_revocation_notice_days: 30,
  rights_confirmed: false,
  // Compliance defaults (migration 028)
  eligible_states: [],
  target_platforms: [],
  compliance_checklist_done: false,
};

function normalizeHashtag(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (!trimmed) return '';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function normalizeDeadline(value: string | null | undefined) {
  if (!value?.trim()) return undefined;
  const normalized = new Date(value);
  if (Number.isNaN(normalized.getTime())) return value;
  return normalized.toISOString();
}

export function createSuggestedApplicationDeadline(baseDate = new Date()) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + DEFAULT_APPLICATION_DEADLINE_DAYS_OUT);
  next.setHours(DEFAULT_APPLICATION_DEADLINE_HOUR, 0, 0, 0);
  return next.toISOString();
}

function buildStepDefaults(state: CampaignFormState, step: StepNumber) {
  if (step >= 5 && !state.application_deadline) {
    return { application_deadline: createSuggestedApplicationDeadline() };
  }

  return {};
}

export const useCampaignForm = create<CampaignFormState & CampaignFormActions>()(
  subscribeWithSelector((set) => ({
    ...INITIAL_STATE,

    patch: (changes) =>
      set((state) => {
        const normalizedChanges = { ...changes };
        if ("application_deadline" in normalizedChanges) {
          normalizedChanges.application_deadline = normalizeDeadline(
            normalizedChanges.application_deadline
          );
        }

        return {
          ...state,
          ...normalizedChanges,
        };
      }),

    setStep: (step) =>
      set((state) => ({
        current_step: step,
        ...buildStepDefaults(state, step),
      })),

    toggleCategory: (cat) =>
      set((state) => {
        const cats = state.categories ?? [];
        return {
          categories: cats.includes(cat)
            ? cats.filter((c) => c !== cat)
            : [...cats, cat],
        };
      }),

    toggleContentFormat: (fmt) =>
      set((state) => {
        const fmts = state.content_types ?? [];
        return {
          content_types: fmts.includes(fmt)
            ? fmts.filter((f) => f !== fmt)
            : [...fmts, fmt],
        };
      }),

    togglePaymentMethod: (m) =>
      set((state) => {
        const methods = state.payment_methods ?? [];
        return {
          payment_methods: methods.includes(m)
            ? methods.filter((x) => x !== m)
            : [...methods, m],
        };
      }),

    addHashtag: (raw) => {
      const normalized = normalizeHashtag(raw);
      if (!normalized || normalized === '#') return;
      set((state) => {
        const tags = state.required_hashtags ?? [];
        // Don't allow duplicates. Also don't allow re-adding #ad
        // (it's locked + auto-injected for paid; brand can't remove it
        // and can't re-add it as a regular tag).
        if (tags.includes(normalized)) return {};
        return { required_hashtags: [...tags, normalized] };
      });
    },

    removeHashtag: (tag) =>
      set((state) => {
        if (
          tag === '#ad' &&
          (state.campaign_type === 'paid' || state.campaign_type === 'hybrid')
        ) {
          return {};
        }
        if (
          tag === '#gifted' &&
          (state.campaign_type === 'gifting' || state.campaign_type === 'hybrid')
        ) {
          return {};
        }
        return {
          required_hashtags: (state.required_hashtags ?? []).filter(
            (t) => t !== tag
          ),
        };
      }),

    addBullet: (field, text = '') => {
      set((state) => ({
        [field]: [...(state[field] ?? []), text],
      }));
    },

    removeBullet: (field, index) =>
      set((state) => ({
        [field]: (state[field] ?? []).filter((_, i) => i !== index),
      })),

    updateBullet: (field, index, text) =>
      set((state) => ({
        [field]: (state[field] ?? []).map((v, i) => (i === index ? text : v)),
      })),

    hydrate: (draft, brandCreditsBalance) => {
      if (!draft) {
        set({
          ...INITIAL_STATE,
          brand_credits_balance: brandCreditsBalance,
        });
        return;
      }
      const currentStep = (draft.current_step as StepNumber) ?? 1;
      const hydratedState: CampaignFormState = {
        ...INITIAL_STATE,
        ...draft.form_state,
        draft_id: draft.id,
        current_step: currentStep,
        brand_credits_balance: brandCreditsBalance,
      };

      set({
        ...hydratedState,
        ...buildStepDefaults(hydratedState, currentStep),
      });
    },

    markSaved: (draftId) =>
      set({
        draft_id: draftId,
        last_saved_at: Date.now(),
      }),

    reset: () => set(INITIAL_STATE),
  }))
);

// -----------------------------------------------------------
// Derived selectors — small pure functions consumers use to read
// computed values without triggering re-renders on unrelated fields.
// -----------------------------------------------------------

export function selectCreditCost(state: CampaignFormState): number {
  if (!state.campaign_type) return 0;
  return CREDIT_COST_BY_TYPE[state.campaign_type];
}

export function selectTotalCreditsRequired(state: CampaignFormState): number {
  const perCreator = selectCreditCost(state);
  const slots = state.slots_available ?? 0;
  return perCreator * slots;
}

export function selectBalanceAfterPublish(state: CampaignFormState): number {
  return state.brand_credits_balance - selectTotalCreditsRequired(state);
}

export function selectHasInsufficientCredits(state: CampaignFormState): boolean {
  return selectBalanceAfterPublish(state) < 0;
}

// Step completion check — used by the sidebar checklist to show
// complete/in-progress/not-started status. This is the single source of
// truth for what counts as "done" per step.
export function selectStepStatus(
  state: CampaignFormState,
  step: StepNumber
): 'complete' | 'in_progress' | 'not_started' | 'error' {
  switch (step) {
    case 1:
      return state.campaign_type ? 'complete' : 'not_started';

    case 2: {
      const hasTitle = !!state.title?.trim();
      const hasShortDesc = !!state.short_description?.trim();
      const hasImage = !!state.image_url;
      const hasCategories = (state.categories?.length ?? 0) > 0;
      const filled = [hasTitle, hasShortDesc, hasImage, hasCategories].filter(
        Boolean
      ).length;
      if (filled === 4) return 'complete';
      if (filled > 0) return 'in_progress';
      return 'not_started';
    }

    case 3: {
      // Field requirements depend on campaign type.
      const type = state.campaign_type;
      if (!type) return 'not_started';
      if (type === 'paid' || type === 'hybrid') {
        const hasCash = (state.cash_amount ?? 0) > 0;
        const hasMethods = (state.payment_methods?.length ?? 0) > 0;
        if (type === 'paid') {
          if (hasCash && hasMethods) return 'complete';
          if (hasCash || hasMethods) return 'in_progress';
          return 'not_started';
        }
        // hybrid — needs cash, methods, AND product
        const hasProduct = !!state.product_description?.trim();
        const filled = [hasCash, hasMethods, hasProduct].filter(Boolean).length;
        if (filled === 3) return 'complete';
        if (filled > 0) return 'in_progress';
        return 'not_started';
      }
      // gifting — needs product description
      return state.product_description?.trim() ? 'complete' : 'not_started';
    }

    case 4: {
      const hasFormats = (state.content_types?.length ?? 0) > 0;
      const hasMention = !!state.brand_mention?.trim();
      const hasBrief = !!state.description?.trim();
      // Filter out auto-injected compliance tags — they don't count as
      // user progress since they were added when the type was picked.
      const userTags = (state.required_hashtags ?? []).filter(
        (t) => t !== '#ad' && t !== '#gifted'
      );
      const hasUserTags = userTags.length > 0;
      const filled = [hasFormats, hasMention, hasBrief, hasUserTags].filter(
        Boolean
      ).length;
      // For "complete" the four required items are: formats, mention,
      // brief, AND at least the auto-injected compliance tag (which is
      // always there for paid/hybrid/gifting — so hashtags requirement
      // is satisfied automatically).
      const complete =
        hasFormats &&
        hasMention &&
        hasBrief &&
        (state.required_hashtags?.length ?? 0) > 0;
      if (complete) return 'complete';
      if (filled > 0) return 'in_progress';
      return 'not_started';
    }

    case 5: {
      // Treat default slots_available as "not filled" — only count slots
      // if the brand explicitly touched the field (tracked by deadline
      // being set, which is the field that always requires explicit action).
      const hasDeadline = !!state.application_deadline;
      const slots = state.slots_available ?? 0;
      // Explicit user interaction signal — they either set slots > 1 or
      // set the deadline. slots_available === 1 is the default and alone
      // shouldn't trigger "in progress".
      const touchedSlots = slots > 1;
      if (selectHasInsufficientCredits(state)) return 'error';
      if (slots > 0 && hasDeadline) return 'complete';
      if (touchedSlots || hasDeadline) return 'in_progress';
      return 'not_started';
    }

    case 6: {
      // Step 6 is "complete" when steps 1-5 are all complete.
      const step1 = selectStepStatus(state, 1);
      const step2 = selectStepStatus(state, 2);
      const step3 = selectStepStatus(state, 3);
      const step4 = selectStepStatus(state, 4);
      const step5 = selectStepStatus(state, 5);
      if (
        step1 === 'complete' &&
        step2 === 'complete' &&
        step3 === 'complete' &&
        step4 === 'complete' &&
        step5 === 'complete'
      )
        return 'complete';
      return 'not_started';
    }
  }
}

export function selectStepMissingFields(
  state: CampaignFormState,
  step: StepNumber
): string[] {
  switch (step) {
    case 1:
      return state.campaign_type ? [] : ["campaign type"];

    case 2: {
      const missing: string[] = [];
      if (!state.title?.trim()) missing.push("title");
      if (!state.short_description?.trim()) missing.push("short description");
      if (!state.image_url?.trim()) missing.push("hero image");
      if ((state.categories?.length ?? 0) === 0) missing.push("at least one category");
      return missing;
    }

    case 3: {
      const type = state.campaign_type;
      if (!type) return ["campaign type"];

      const missing: string[] = [];
      if (type === "paid" || type === "hybrid") {
        if ((state.cash_amount ?? 0) <= 0) missing.push("cash amount");
        if ((state.payment_methods?.length ?? 0) === 0) missing.push("payment method");
      }
      if (type === "gifting" || type === "hybrid") {
        if (!state.product_description?.trim()) missing.push("product description");
      }
      return missing;
    }

    case 4: {
      const missing: string[] = [];
      if ((state.content_types?.length ?? 0) === 0) missing.push("content format");
      if (!state.brand_mention?.trim()) missing.push("brand mention");
      if (!state.description?.trim()) missing.push("campaign brief");
      if ((state.required_hashtags?.length ?? 0) === 0) missing.push("required hashtags");
      return missing;
    }

    case 5: {
      const missing: string[] = [];
      if ((state.slots_available ?? 0) <= 0) missing.push("slots available");
      if (!state.application_deadline) missing.push("application deadline");
      if (selectHasInsufficientCredits(state)) missing.push("available credits");
      return missing;
    }

    case 6: {
      const missing = ([1, 2, 3, 4, 5] as StepNumber[]).flatMap((currentStep) =>
        selectStepMissingFields(state, currentStep)
      );
      if (!state.compliance_checklist_done) missing.push('compliance checklist');
      return missing;
    }
  }
}

export function selectCanPublish(state: CampaignFormState): boolean {
  return (
    selectStepStatus(state, 6) === 'complete' &&
    !selectHasInsufficientCredits(state) &&
    state.compliance_checklist_done === true
  );
}

// -----------------------------------------------------------
// FTC compliance: auto-inject the required disclosure hashtag
// when the campaign type is set. Called from the type picker
// after the brand picks gifting / paid / hybrid.
// -----------------------------------------------------------
export function autoInjectComplianceTag(state: CampaignFormState): string[] {
  const tags = new Set(state.required_hashtags ?? []);
  if (state.campaign_type === 'paid' || state.campaign_type === 'hybrid') {
    tags.add('#ad');
  }
  if (state.campaign_type === 'gifting' || state.campaign_type === 'hybrid') {
    tags.add('#gifted');
  }
  return Array.from(tags);
}
