import Link from "next/link";
import {
  ArrowRight,
  Check,
  Compass,
  LayoutPanelLeft,
  MoveRight,
  Sparkles,
  Workflow
} from "lucide-react";
import { Button } from "../ui/button";

const comparisonRows = [
  {
    label: "First impression",
    current: "Premium ingredients show up, but the screen still opens like a stack of capable cards.",
    proposed: "Open with a single editorial thesis: clear title, concise operator brief, and one dominant command plane."
  },
  {
    label: "Information density",
    current: "Signals compete at the same weight, so scanning depends on reading everything.",
    proposed: "Promote one primary decision at a time, then let secondary evidence sit in quieter rails and ledgers."
  },
  {
    label: "Typography",
    current: "Serif moments are attractive, but they can drift into decorative territory.",
    proposed: "Reserve serif for section titles and proof moments; keep working copy disciplined, crisp, and operational."
  },
  {
    label: "Marketplace energy",
    current: "The product feels premium, yet slightly static once the hero ends.",
    proposed: "Use motion and sequencing to imply an active desk: incoming signals, queued work, and deliberate follow-through."
  }
];

const operatorPrinciples = [
  "One loud command area, one quiet evidence rail, one ledger for momentum.",
  "Fewer containers, longer visual lines, and stronger section boundaries.",
  "Warm editorial materiality without collapsing into lifestyle-brand softness.",
  "Buttons and states should read like actions an operator trusts immediately."
];

const layoutBands = [
  {
    title: "Command masthead",
    detail: "Campaign status, confidence markers, and the next action live together in a single opening band."
  },
  {
    title: "Decision ledger",
    detail: "Instead of four equal KPI cards, the surface elevates the single queue or campaign that needs action now."
  },
  {
    title: "Evidence rail",
    detail: "Creator proof, payout timing, and trust signals sit in a calmer side lane rather than interrupting the whole canvas."
  },
  {
    title: "Operational flow",
    detail: "Lists read as working documents, not product tiles, so the page feels like software for a team with standards."
  }
];

const materialNotes = [
  "Warm parchment gradients with quieter chrome",
  "Rounded surfaces used as large planes instead of repeated widgets",
  "Restrained serif accents paired with sober sans-serif utility copy",
  "Soft motion on reveal and hover, never ornamental bounce"
];

function ComparisonTable() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,243,236,0.74))] shadow-[0_28px_90px_rgba(33,27,20,0.1)] backdrop-blur">
      <div className="grid gap-6 border-b border-black/8 px-6 py-6 md:grid-cols-[0.34fr_0.33fr_0.33fr] md:px-8">
        <div>
          <div className="text-xs uppercase tracking-[0.26em] text-surface-500">Comparison</div>
          <h2 className="mt-3 font-display text-4xl text-surface-900">From attractive dashboard to editorial operator desk</h2>
        </div>
        <div className="rounded-[24px] border border-black/6 bg-[rgba(89,68,49,0.04)] px-5 py-5">
          <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Current expression</div>
          <p className="mt-3 text-sm leading-7 text-surface-700">
            Warm, premium, and credible, but still governed by card rhythm and evenly weighted modules.
          </p>
        </div>
        <div className="rounded-[24px] border border-herb-700/15 bg-[linear-gradient(180deg,rgba(108,140,75,0.09),rgba(255,255,255,0.58))] px-5 py-5">
          <div className="text-xs uppercase tracking-[0.22em] text-herb-700">Approved direction</div>
          <p className="mt-3 text-sm leading-7 text-surface-800">
            More structured, more commanding, and more editorial, with hierarchy doing more work than chrome.
          </p>
        </div>
      </div>

      <div>
        {comparisonRows.map((row, index) => (
          <div
            className="grid gap-4 border-b border-black/6 px-6 py-5 last:border-b-0 md:grid-cols-[0.34fr_0.33fr_0.33fr] md:px-8"
            key={row.label}
          >
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-surface-500">0{index + 1}</div>
              <div className="mt-2 text-lg font-semibold text-surface-900">{row.label}</div>
            </div>
            <p className="text-sm leading-7 text-surface-700">{row.current}</p>
            <p className="text-sm leading-7 text-surface-800">{row.proposed}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OperatorLayout() {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(251,246,240,0.74))] px-6 py-6 shadow-[0_24px_80px_rgba(33,27,20,0.09)] md:px-8">
        <div className="flex items-center gap-3 text-herb-700">
          <LayoutPanelLeft className="h-5 w-5" />
          <div className="text-xs uppercase tracking-[0.24em]">Surface anatomy</div>
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl text-surface-900">
          The page should read like a disciplined operating system, not a showcase of premium widgets.
        </h2>

        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-black/7 bg-[linear-gradient(135deg,rgba(255,255,255,0.76),rgba(246,236,225,0.58))] px-5 py-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Command masthead</div>
                <div className="mt-2 font-display text-3xl text-surface-900">Spring launch review in motion</div>
              </div>
              <div className="rounded-full border border-herb-700/15 bg-herb-700/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-herb-700">
                12 creator submissions ready
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-surface-700">
              One sentence sets the operator context. Actions stay adjacent, so the user knows what to do before they
              start parsing secondary data.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="rounded-[28px] border border-black/7 bg-white/70 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Decision ledger</div>
                  <div className="mt-2 text-2xl font-semibold text-surface-900">Priority campaigns and next moves</div>
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Sorted by urgency</div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["Houseplant Supply Co.", "6 applicants need review", "Open queue"],
                  ["Northbank Extracts", "2 revisions waiting on proof", "See revisions"],
                  ["Juniper Farms", "Payout window due tomorrow", "Confirm payouts"]
                ].map(([name, status, action]) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 border-t border-black/6 py-3 first:border-t-0 first:pt-0 last:pb-0"
                    key={name}
                  >
                    <div>
                      <div className="text-sm font-semibold text-surface-900">{name}</div>
                      <div className="mt-1 text-sm text-surface-600">{status}</div>
                    </div>
                    <div className="text-sm font-medium text-herb-700">{action}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/7 bg-[rgba(248,242,235,0.8)] px-5 py-5">
              <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Evidence rail</div>
              <div className="mt-3 space-y-4">
                {[
                  ["Verification pace", "Median review in 4.1 hours"],
                  ["Trust layer", "92% creator follow-through this week"],
                  ["Payout visibility", "3 confirmations awaiting finance"]
                ].map(([label, value]) => (
                  <div className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0" key={label}>
                    <div className="text-sm text-surface-500">{label}</div>
                    <div className="mt-2 text-lg font-semibold text-surface-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(251,246,240,0.74))] px-6 py-6 shadow-[0_24px_80px_rgba(33,27,20,0.08)]">
          <div className="flex items-center gap-3 text-herb-700">
            <Workflow className="h-5 w-5" />
            <div className="text-xs uppercase tracking-[0.24em]">Hierarchy rules</div>
          </div>
          <div className="mt-5 space-y-4">
            {layoutBands.map((band, index) => (
              <div className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0" key={band.title}>
                <div className="flex items-center gap-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-surface-500">0{index + 1}</div>
                  <div className="text-lg font-semibold text-surface-900">{band.title}</div>
                </div>
                <p className="mt-2 text-sm leading-7 text-surface-700">{band.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,243,236,0.76))] px-6 py-6 shadow-[0_24px_80px_rgba(33,27,20,0.08)]">
          <div className="flex items-center gap-3 text-herb-700">
            <Sparkles className="h-5 w-5" />
            <div className="text-xs uppercase tracking-[0.24em]">Material and motion</div>
          </div>
          <div className="mt-5 space-y-3">
            {materialNotes.map((item) => (
              <div className="flex items-start gap-3 rounded-[22px] border border-black/6 bg-white/58 px-4 py-4" key={item}>
                <Check className="mt-0.5 h-4 w-4 flex-none text-herb-700" />
                <p className="text-sm leading-7 text-surface-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function EditorialOperatorReview() {
  return (
    <main className="grid-overlay min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
        <header className="animate-enter flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/72 px-5 py-3 shadow-[0_18px_50px_rgba(33,27,20,0.08)] backdrop-blur">
          <div className="premium-badge">
            <span className="signal-dot" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">BudCast Design Review</div>
              <div className="text-sm font-medium text-surface-900">Editorial Operator comparison surface</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/creator-preview">
                Creator counterpart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="hero-orbit grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="animate-enter animate-enter-delay-1 overflow-hidden rounded-[36px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(252,245,236,0.72))] px-7 py-8 shadow-[0_28px_100px_rgba(33,27,20,0.1)] md:px-9 md:py-10">
            <div className="flex flex-wrap items-center gap-3 text-herb-700">
              <div className="premium-badge bg-white/68">
                <Compass className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-[0.22em]">Editorial Operator</span>
              </div>
              <div className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.24em] text-surface-600">
                Approved direction for BudCast brand-side comparison
              </div>
            </div>

            <div className="mt-10 max-w-4xl">
              <h1 className="font-display text-5xl leading-[0.92] text-surface-900 md:text-7xl">
                Premium marketplace software with editorial warmth, operator discipline, and less dashboard clutter.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-surface-700 md:text-lg">
                This comparison route translates the approved direction into a clearer operating posture: fewer repeated
                cards, stronger command hierarchy, restrained serif usage, and longer layout lines that feel credible
                for a serious B2B marketplace.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Compare against live dashboard
                  <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard/submissions">See submission operations</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="animate-enter animate-enter-delay-2 rounded-[32px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(249,243,236,0.76))] px-6 py-6 shadow-[0_24px_80px_rgba(33,27,20,0.08)]">
              <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Core shifts</div>
              <div className="mt-5 space-y-4">
                {operatorPrinciples.map((item) => (
                  <div className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0" key={item}>
                    <p className="text-sm leading-7 text-surface-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-enter animate-enter-delay-3 rounded-[32px] border border-herb-700/10 bg-[linear-gradient(180deg,rgba(108,140,75,0.08),rgba(255,255,255,0.82))] px-6 py-6 shadow-[0_24px_80px_rgba(33,27,20,0.08)]">
              <div className="text-xs uppercase tracking-[0.24em] text-herb-700">Why it feels better</div>
              <p className="mt-4 font-display text-3xl text-surface-900">
                The interface stops performing premium and starts behaving like premium software.
              </p>
              <p className="mt-4 text-sm leading-7 text-surface-700">
                Structure does the heavy lifting. The user sees where to act first, where to review evidence next, and
                where marketplace momentum is heading without needing a wall of boxed modules.
              </p>
            </div>
          </div>
        </section>

        <ComparisonTable />
        <OperatorLayout />
      </div>
    </main>
  );
}
