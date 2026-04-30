/**
 * Formatters — site-wide rules for displaying counts, dates, currency,
 * and enum values. All UI formatting flows through this module.
 *
 * Rule: no hand-rolled formatting in component code.
 *
 * @see docs/design-tokens.md §15
 */

// ---------------------------------------------------------------------------
// Pluralization
// ---------------------------------------------------------------------------

/**
 * Returns "N <singular|plural>" based on count. Uses naive English rules
 * (add 's' for plural). Pass an explicit plural when the noun is irregular.
 *
 *   formatCount('application', 0)  -> '0 applications'
 *   formatCount('application', 1)  -> '1 application'
 *   formatCount('application', 5)  -> '5 applications'
 *   formatCount('child', 2, 'children') -> '2 children'
 */
export function formatCount(
  singular: string,
  count: number,
  plural?: string,
): string {
  const word = count === 1 ? singular : plural ?? `${singular}s`;
  return `${count} ${word}`;
}

/**
 * Just the noun, correctly pluralized — for cases where the number is
 * rendered separately (e.g. big stat card with number + label).
 *
 *   pluralize('application', 0) -> 'applications'
 *   pluralize('application', 1) -> 'application'
 */
export function pluralize(
  singular: string,
  count: number,
  plural?: string,
): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

// ---------------------------------------------------------------------------
// Dates / deadlines
// ---------------------------------------------------------------------------

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Formats a deadline relative to now.
 *   < 24h   -> 'Today' or 'Tomorrow'
 *   < 7d    -> '4d left'        (meant to be rendered in mono)
 *   < 30d   -> 'May 10'
 *   >= 30d  -> 'May 10, 2026'
 *   past    -> 'Expired'
 *   null    -> 'No deadline'
 */
export function formatDeadline(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return 'No deadline';
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return 'No deadline';

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';

  const diffDays = diffMs / DAY_MS;

  if (diffDays < 1) {
    // If the target date is the same calendar day, "Today"; if it's tomorrow, "Tomorrow"
    const sameDay =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate();
    return sameDay ? 'Today' : 'Tomorrow';
  }
  if (diffDays < 7) {
    return `${Math.ceil(diffDays)}d left`;
  }
  if (diffDays < 30) {
    return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Tone for a deadline — used to pick a semantic color.
 *   past          -> 'expired'
 *   < 3 days      -> 'urgent'
 *   < 7 days      -> 'soon'
 *   else          -> 'normal'
 */
export type DeadlineTone = 'expired' | 'urgent' | 'soon' | 'normal';

export function deadlineTone(iso: string | null | undefined, now: Date = new Date()): DeadlineTone {
  if (!iso) return 'normal';
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return 'normal';
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'expired';
  const diffDays = diffMs / DAY_MS;
  if (diffDays < 3) return 'urgent';
  if (diffDays < 7) return 'soon';
  return 'normal';
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

/**
 * Formats a whole-dollar amount. No cents. US formatting.
 *   formatCurrency(100)    -> '$100'
 *   formatCurrency(1500)   -> '$1,500'
 *   formatCurrency(10000)  -> '$10,000'
 *   formatCurrency(null)   -> '—'
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

// ---------------------------------------------------------------------------
// Content type enums
// ---------------------------------------------------------------------------

const CONTENT_TYPE_LABELS: Record<string, string> = {
  ig_reel: 'Instagram Reel',
  ig_post: 'Instagram Post',
  ig_story: 'Instagram Story',
  tiktok_video: 'TikTok Video',
  youtube_video: 'YouTube Video',
  youtube_short: 'YouTube Short',
  twitter_post: 'X Post',
};

/**
 * Maps a raw DB enum to a display label. Falls back to a
 * title-cased version of the raw value if unknown.
 *   formatContentType('ig_reel')      -> 'Instagram Reel'
 *   formatContentType('tiktok_video') -> 'TikTok Video'
 */
export function formatContentType(raw: string): string {
  return (
    CONTENT_TYPE_LABELS[raw] ??
    startCase(raw)
  );
}

const POST_TYPE_LABELS: Record<string, string> = {
  instagram_post: 'Instagram Post',
  instagram_story: 'Instagram Story',
  instagram_reel: 'Instagram Reel',
  tiktok_video: 'TikTok Video',
  youtube_video: 'YouTube Video',
  youtube_short: 'YouTube Short',
};

export function formatPostType(raw: string | null | undefined): string {
  if (!raw) return 'Not specified';
  return POST_TYPE_LABELS[raw] ?? startCase(raw);
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  venmo: 'Venmo',
  zelle: 'Zelle',
  cashapp: 'Cash App',
  paypal: 'PayPal',
};

export function formatPaymentMethod(raw: string | null | undefined): string {
  if (!raw) return 'Not specified';
  return PAYMENT_METHOD_LABELS[raw] ?? startCase(raw);
}

// ---------------------------------------------------------------------------
// Campaign type enums
// ---------------------------------------------------------------------------

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  gifting: 'Product',
  paid: 'Paid',
  hybrid: 'Paid + Product',
};

export function formatCampaignType(raw: string): string {
  return CAMPAIGN_TYPE_LABELS[raw] ?? raw;
}

export function formatValueLabel(raw: string | null | undefined): string {
  if (!raw) return "—";
  return startCase(raw);
}

// ---------------------------------------------------------------------------
// Application / campaign status enums
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  completed: 'Completed',
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  closed: 'Closed',
  awaiting_creator: 'Awaiting content',
  pending_verification: 'Needs review',
  ready_for_payout: 'Ready for payment',
  needs_revision: 'Needs revision',
  verified: 'Approved',
};

export function formatStatus(raw: string): string {
  return (
    STATUS_LABELS[raw] ??
    startCase(raw)
  );
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/**
 * Compact follower counts and large numbers.
 *   formatCompact(950)     -> '950'
 *   formatCompact(1200)    -> '1.2K'
 *   formatCompact(45000)   -> '45K'
 *   formatCompact(1200000) -> '1.2M'
 */
export function formatCompact(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  if (n < 1000) return n.toString();
  if (n < 1_000_000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}K` : `${k.toFixed(1).replace(/\.0$/, '')}K`;
  }
  const m = n / 1_000_000;
  return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1).replace(/\.0$/, '')}M`;
}

function startCase(raw: string): string {
  return raw
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
