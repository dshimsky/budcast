import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpLeft,
  AudioWaveform,
  BadgeCheck,
  ChartNoAxesCombined,
  Leaf,
  MoonStar,
  ScanSearch,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { Button } from "../ui/button";

const thesisPoints = [
  "Night-club restraint instead of gamer neon",
  "Premium cannabis adjacency through olive, brass, smoke, and low light",
  "Operator-grade surfaces that still scan like a real marketplace"
];

const comparisonRows = [
  {
    label: "Emotional read",
    editorial: "Daylit editorial trust, optimistic and open.",
    moody: "Private-room confidence, slower and more deliberate."
  },
  {
    label: "Surface language",
    editorial: "Warm glass, parchment neutrals, airy spacing.",
    moody: "Ink-black lacquer, bronze trims, smoked glass, sharper contrast."
  },
  {
    label: "Cannabis signal",
    editorial: "Lifestyle-adjacent and broadly premium.",
    moody: "Cannabis-adjacent by tone: cured herb, velvet lounge, secure vault."
  },
  {
    label: "Operator posture",
    editorial: "Visible command hierarchy with broader daylight clarity.",
    moody: "Focused review posture with fewer distractions and stronger task gravity."
  }
];

const principleColumns = [
  {
    title: "Keep",
    eyebrow: "What survives the shift",
    points: ["Trust-first hierarchy", "Clear marketplace actions", "Evidence-led review loops"]
  },
  {
    title: "Push",
    eyebrow: "What this direction amplifies",
    points: ["Cinema-grade contrast", "VIP atmosphere", "More deliberate motion + cadence"]
  },
  {
    title: "Avoid",
    eyebrow: "Guardrails",
    points: ["Neon green glow", "Esports dashboard density", "Generic black-glass SaaS tiles"]
  }
];

const operatingColumns = [
  {
    title: "Launch board",
    metric: "03",
    label: "Campaigns awaiting brand sign-off",
    detail: "High-value drops hold in a narrow queue with credit state and compliance check visibility."
  },
  {
    title: "Shortlist review",
    metric: "18",
    label: "Verified creators in focused review",
    detail: "The concept favors larger evidence blocks, fewer simultaneous decisions, and stronger status contrast."
  },
  {
    title: "Payout window",
    metric: "$9.4k",
    label: "Creator payouts ready after proof approval",
    detail: "Money moments feel calm and ceremonial, not flashy, which reinforces trust."
  }
];

const scenePanels = [
  {
    icon: MoonStar,
    title: "Cinematic by composition",
    description:
      "The first screen reads like a poster for a private marketplace, then resolves into a real control surface as soon as you scan right.",
    accent: "from-[#85704f]/45 via-[#263326]/15 to-transparent"
  },
  {
    icon: ShieldCheck,
    title: "Trust through restraint",
    description:
      "Status color is used sparsely. Verified, pending, and release states stay legible without shouting, which keeps premium cues intact.",
    accent: "from-[#33422d]/45 via-[#171b17]/10 to-transparent"
  },
  {
    icon: Leaf,
    title: "Cannabis-adjacent, not cliché",
    description:
      "Olive undertones, soft brass, and a dense smoked atmosphere suggest category relevance without resorting to overt weed iconography.",
    accent: "from-[#5f693f]/35 via-[#2a2218]/12 to-transparent"
  }
];

function Surface({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,21,19,0.92),rgba(11,12,11,0.92))] shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function DarkMoodyComparison() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080a08] px-5 py-5 text-stone-100 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,112,75,0.18),transparent_0_26%),radial-gradient(circle_at_85%_10%,rgba(63,85,48,0.17),transparent_0_22%),linear-gradient(180deg,#0a0c0a_0%,#080908_46%,#060706_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(214,202,182,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(214,202,182,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
        <div className="absolute left-[-8rem] top-[8rem] h-[22rem] w-[22rem] rounded-full bg-[#52613b]/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-3rem] h-[24rem] w-[24rem] rounded-full bg-[#8e7652]/16 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <header className="animate-enter flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-black/25 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-[#8a7754]/30 bg-[#171a16] p-2.5 text-[#d4c3a0]">
              <MoonStar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.34em] text-stone-400">BudCast Design Review</div>
              <div className="text-sm text-stone-100">Dark Premium Moody comparison route</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-stone-400">
              Cinematic, expensive, high-trust
            </div>
            <Button asChild className="bg-[#7d6a4b] text-stone-950 shadow-[0_18px_50px_rgba(125,106,75,0.28)] hover:bg-[#94815d]">
              <Link href="/design-review">
                Back to review hub
                <ArrowUpLeft className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <Surface className="animate-enter animate-enter-delay-1 overflow-hidden px-6 py-7 md:px-8 md:py-9">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b59667]/60 to-transparent" />
            <div className="max-w-4xl">
              <div className="mb-5 flex flex-wrap gap-2">
                <div className="rounded-full border border-[#ab9367]/25 bg-[#1a1712] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#d3bea0]">
                  Variant thesis
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-stone-400">
                  Comparison surface only
                </div>
              </div>

              <h1 className="max-w-4xl font-display text-5xl leading-[0.9] text-[#f5efe6] md:text-7xl">
                BudCast as a midnight market: cinematic, controlled, and credible.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
                This concept shifts BudCast from editorial daylight into a private, expensive mood. The goal is not a
                dark SaaS reskin. It is a higher-trust marketplace that feels like money, review, and reputation are
                handled in a protected room.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-[#7d6a4b] text-stone-950 shadow-[0_18px_50px_rgba(125,106,75,0.28)] hover:bg-[#94815d]"
                  size="lg"
                >
                  <Link href="#control-surface">
                    See control surface
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="border border-white/12 bg-white/[0.04] text-stone-100 hover:bg-white/[0.08]"
                  size="lg"
                  variant="secondary"
                >
                  <Link href="#comparison">Compare against Editorial Operator</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 md:grid-cols-3">
                {thesisPoints.map((point, index) => (
                  <div
                    className={`rounded-[24px] border border-white/10 bg-white/[0.04] p-4 ${
                      index === 1 ? "animate-float" : ""
                    }`}
                    key={point}
                  >
                    <div className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                      0{index + 1}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-200">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </Surface>

          <Surface className="animate-enter animate-enter-delay-2 relative overflow-hidden px-5 py-5 md:px-6 md:py-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_0_38%),linear-gradient(180deg,rgba(173,145,103,0.12),transparent_36%,transparent)]" />
            <div className="relative grid gap-4">
              <div className="rounded-[26px] border border-[#b59667]/16 bg-[#101210]/90 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Operator focus</div>
                    <h2 className="mt-3 text-2xl font-semibold text-[#f5efe6]">Reserve campaign release</h2>
                  </div>
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300">
                    Verified for launch
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[22px] border border-white/8 bg-[linear-gradient(160deg,rgba(33,37,33,0.95),rgba(16,18,16,0.95))] p-4">
                    <div className="flex items-center justify-between text-sm text-stone-300">
                      <span>Nightfall cartridge drop</span>
                      <span className="text-[#ccb48d]">$12.4k</span>
                    </div>
                    <div className="mt-4 h-44 rounded-[18px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(131,109,75,0.2),transparent_0_34%),linear-gradient(180deg,rgba(20,22,20,0.98),rgba(8,9,8,0.96))] p-4">
                      <div className="flex items-end justify-between">
                        {[62, 78, 56, 89, 74, 94, 71].map((value, index) => (
                          <div className="flex items-end gap-2" key={`${value}-${index}`}>
                            <div
                              className="w-6 rounded-t-full bg-gradient-to-t from-[#3b4a2f] via-[#71834c] to-[#ccb48d]"
                              style={{ height: `${value}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-2 text-[#ccb48d]">
                        <ScanSearch className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.28em]">Review state</span>
                      </div>
                      <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">18 / 22</div>
                      <p className="mt-2 text-sm leading-6 text-stone-400">
                        Creators cleared for shortlist after tone, audience, and proof-read checks.
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <WalletCards className="h-4 w-4" />
                        <span className="text-[11px] uppercase tracking-[0.28em]">Payout readiness</span>
                      </div>
                      <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">$9,420</div>
                      <p className="mt-2 text-sm leading-6 text-stone-400">
                        Funds held cleanly behind proof approval instead of feeling like a tacked-on finance panel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {operatingColumns.map((column) => (
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4" key={column.title}>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">{column.title}</div>
                    <div className="mt-3 text-4xl font-semibold text-[#f5efe6]">{column.metric}</div>
                    <div className="mt-2 text-sm font-medium text-stone-200">{column.label}</div>
                    <p className="mt-3 text-sm leading-6 text-stone-400">{column.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </Surface>
        </section>

        <section id="comparison" className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <Surface className="animate-enter animate-enter-delay-2 px-6 py-6 md:px-7">
            <div className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Direction framing</div>
            <h2 className="mt-3 font-display text-4xl text-[#f5efe6]">What this direction changes</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-stone-300">
              The comparison should make a decision easier, not just show a different coat of paint. Dark Premium
              Moody is strongest when BudCast wants more ceremony around trust, money, and premium brand access.
            </p>

            <div className="mt-7 grid gap-3">
              {principleColumns.map((column) => (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4" key={column.title}>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-[#ccb48d]">{column.eyebrow}</div>
                  <div className="mt-2 text-xl font-semibold text-[#f5efe6]">{column.title}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {column.points.map((point) => (
                      <div
                        className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-300"
                        key={point}
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="animate-enter animate-enter-delay-3 overflow-hidden px-2 py-2">
            <div className="grid gap-px overflow-hidden rounded-[28px] bg-white/10">
              <div className="grid grid-cols-[0.78fr_1fr_1fr] gap-px bg-white/10">
                <div className="bg-[#0f120f] px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-stone-500">
                  Comparison
                </div>
                <div className="bg-[#0f120f] px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-stone-400">
                  Editorial Operator
                </div>
                <div className="bg-[#0f120f] px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-[#d3bea0]">
                  Dark Premium Moody
                </div>
              </div>

              {comparisonRows.map((row) => (
                <div className="grid grid-cols-[0.78fr_1fr_1fr] gap-px bg-white/10" key={row.label}>
                  <div className="bg-[#0f120f] px-4 py-5 text-sm font-medium text-stone-200">{row.label}</div>
                  <div className="bg-[#0b0d0b] px-4 py-5 text-sm leading-7 text-stone-400">{row.editorial}</div>
                  <div className="bg-[#111310] px-4 py-5 text-sm leading-7 text-stone-200">{row.moody}</div>
                </div>
              ))}
            </div>
          </Surface>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {scenePanels.map((panel, index) => {
            const Icon = panel.icon;

            return (
              <Surface
                className={`animate-enter ${index === 0 ? "animate-enter-delay-1" : index === 1 ? "animate-enter-delay-2" : "animate-enter-delay-3"} relative overflow-hidden px-6 py-6`}
                key={panel.title}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${panel.accent}`} />
                <div className="relative">
                  <div className="rounded-full border border-white/10 bg-black/20 p-3 text-[#d3bea0] w-fit">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 font-display text-3xl text-[#f5efe6]">{panel.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-stone-300">{panel.description}</p>
                </div>
              </Surface>
            );
          })}
        </section>

        <section id="control-surface" className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Surface className="animate-enter animate-enter-delay-2 px-6 py-6 md:px-7 md:py-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Marketplace control surface</div>
                <h2 className="mt-3 font-display text-4xl text-[#f5efe6]">Usable, not just atmospheric</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-stone-400">
                Brand operator concept
              </div>
            </div>

            <div className="mt-7 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-[#ccb48d]">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-[0.28em]">Decision queue</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Proof review", "6 creators waiting on final approval"],
                      ["Compliance hold", "2 assets flagged for caption edits"],
                      ["Funds release", "4 payouts scheduled after midnight sync"]
                    ].map(([title, detail]) => (
                      <div className="rounded-[20px] border border-white/8 bg-black/20 p-4" key={title}>
                        <div className="text-sm font-medium text-stone-100">{title}</div>
                        <div className="mt-1 text-sm leading-6 text-stone-400">{detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <AudioWaveform className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-[0.28em]">Mood controls</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {[
                      ["Contrast", "84%"],
                      ["Ambient motion", "Low"],
                      ["Verification emphasis", "High"]
                    ].map(([label, value]) => (
                      <div className="flex items-center justify-between rounded-full border border-white/8 bg-black/20 px-4 py-3" key={label}>
                        <span className="text-sm text-stone-400">{label}</span>
                        <span className="text-sm font-medium text-stone-100">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,19,17,0.98),rgba(8,9,8,0.98))] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Focused review lane</div>
                    <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">Verified creator shortlist</div>
                  </div>
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300">
                    82% match confidence
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    {
                      name: "Maya Flores",
                      niche: "Premium flower storytelling",
                      status: "Verified audience + payout history"
                    },
                    {
                      name: "Jordan Reed",
                      niche: "Dispensary opening nights",
                      status: "Pending sample proof review"
                    },
                    {
                      name: "Alina Brooks",
                      niche: "Cinematic product closeups",
                      status: "Ready to brief immediately"
                    }
                  ].map((creator) => (
                    <div
                      className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 md:grid-cols-[auto_1fr_auto]"
                      key={creator.name}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b59667]/20 bg-[radial-gradient(circle,rgba(181,150,103,0.35),rgba(27,30,27,0.8))] text-sm font-medium text-[#f5efe6]">
                        {creator.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-stone-100">{creator.name}</div>
                        <div className="mt-1 text-sm text-stone-400">{creator.niche}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-300">
                        {creator.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-[#ccb48d]">
                      <ChartNoAxesCombined className="h-4 w-4" />
                      <span className="text-[11px] uppercase tracking-[0.28em]">Trust signal</span>
                    </div>
                    <div className="mt-4 text-3xl font-semibold text-[#f5efe6]">94</div>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      Weighted operator confidence score driven by payout history and content fit.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[11px] uppercase tracking-[0.28em]">Risk state</span>
                    </div>
                    <div className="mt-4 text-3xl font-semibold text-[#f5efe6]">Low</div>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      The darker system makes green mean something again because it appears rarely and precisely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Surface>

          <Surface className="animate-enter animate-enter-delay-3 px-6 py-6 md:px-7">
            <div className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Decision note</div>
            <h2 className="mt-3 font-display text-4xl text-[#f5efe6]">When to choose this route</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
              <p>
                Choose Dark Premium Moody if BudCast wants to feel more exclusive, more protected, and more
                high-consideration for both brands and creators. It is strongest when the product story centers on
                trusted access rather than broad marketplace openness.
              </p>
              <p>
                Do not choose it if the primary goal is maximum daylight clarity or the broadest possible sense of
                welcome. This direction trades some openness for focus and ceremony.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                "Best for premium campaigns, higher-value drops, and selective creator rosters",
                "Best when payout trust and proof review need more emotional weight",
                "Less ideal if BudCast wants a brighter, more universally accessible first impression"
              ].map((item) => (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-stone-200" key={item}>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-7">
              <Button
                asChild
                className="w-full bg-[#7d6a4b] text-stone-950 shadow-[0_18px_50px_rgba(125,106,75,0.28)] hover:bg-[#94815d]"
                size="lg"
              >
                <Link href="/design-review">
                  Return to variant selector
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Surface>
        </section>
      </div>
    </main>
  );
}
