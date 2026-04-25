"use client";

import Link from "next/link";
import { ArrowRight, MoonStar, SunMedium } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

const variants = [
  {
    href: "/design-review/editorial-operator",
    title: "Editorial Operator",
    eyebrow: "Recommended direction",
    description:
      "Warm editorial polish with stronger structure, sharper hierarchy, and a real operator-grade command surface for brand workflows.",
    bullets: ["Stronger command hierarchy", "Reduced card clutter", "Selective serif usage"],
    icon: SunMedium
  },
  {
    href: "/design-review/dark-moody",
    title: "Dark Premium Moody",
    eyebrow: "Comparison direction",
    description:
      "A cinematic, darker BudCast concept that leans expensive and atmospheric without drifting into neon or generic dark SaaS.",
    bullets: ["Cinematic contrast", "Premium nighttime tone", "High-trust control surface"],
    icon: MoonStar
  }
];

export default function DesignReviewHubPage() {
  return (
    <main className="grid-overlay min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="hero-orbit rounded-[34px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,248,240,0.78))] px-7 py-8 shadow-[0_24px_70px_rgba(33,27,20,0.1)]">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.32em] text-surface-500">BudCast Design Review</div>
            <h1 className="mt-3 font-display text-5xl text-surface-900 md:text-6xl">
              Compare the next visual direction before we lock the system.
            </h1>
            <p className="mt-4 text-base leading-8 text-surface-700">
              This hub is the approval point for BudCast’s next design pass. Review the recommended Editorial Operator
              direction next to a darker premium moody variant before we commit the visual system deeper into web and
              native surfaces.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {variants.map((variant) => {
            const Icon = variant.icon;
            return (
              <Card className="flex h-full flex-col p-7" key={variant.href}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.26em] text-surface-500">{variant.eyebrow}</div>
                    <h2 className="mt-3 font-display text-4xl text-surface-900">{variant.title}</h2>
                  </div>
                  <div className="rounded-full bg-herb-50 p-3 text-herb-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-surface-700">{variant.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {variant.bullets.map((bullet) => (
                    <div
                      className="rounded-full border border-surface-200 bg-white/78 px-3 py-2 text-xs uppercase tracking-[0.2em] text-surface-600"
                      key={bullet}
                    >
                      {bullet}
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href={variant.href}>
                      Open concept
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
