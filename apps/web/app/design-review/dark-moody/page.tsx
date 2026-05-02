import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, MessageCircle, Radio, Sparkles } from "lucide-react";
import { InternalEyebrow, InternalPanel, InternalShell, InternalSubPanel, InternalTopBar } from "../../../components/internal-console";

export const metadata = {
  title: "BudCast Design Review | Social Marketplace OS",
  description: "Approved dark social marketplace direction for BudCast."
};

const principles = [
  ["Campaigns first", "Creators land in active campaign opportunities before abstract dashboard metrics."],
  ["Feed is real", "Brand launches, creator work, reviews, and campaign proof should make BudCast feel alive."],
  ["Messages matter", "Product status, payment details, and campaign coordination happen through messaging."],
  ["Brand-safe cannabis", "No stoner clichés, no fake shipping flows, no medical claims, no gimmicky neon."]
];

export default function DarkMoodyPage() {
  return (
    <InternalShell>
      <InternalTopBar label="Approved design direction" />

      <InternalPanel className="p-6 md:p-8">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-[#d8ded1] hover:text-[#e7ff9a]" href="/design-review">
          <ArrowLeft className="h-4 w-4" />
          Back to design review
        </Link>
        <InternalEyebrow>Approved direction</InternalEyebrow>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#fbfbf7] md:text-7xl">
          BudCast should feel like Instagram/X meets a UGC campaign marketplace.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
          This is the visual standard for the app: near-black atmosphere, coral actions, creator/brand identity cards,
          feed-native campaign surfaces, and operational workflows that still feel social.
        </p>
      </InternalPanel>

      <section className="grid gap-5 lg:grid-cols-4">
        {principles.map(([title, copy], index) => (
          <InternalPanel className="p-5" key={title}>
            <InternalEyebrow>Rule 0{index + 1}</InternalEyebrow>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">{copy}</p>
          </InternalPanel>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <InternalPanel className="p-5 md:p-6">
          <div className="flex items-center gap-2 text-[#e7ff9a]">
            <Radio className="h-5 w-5" />
            <InternalEyebrow>Primary creator surface</InternalEyebrow>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["Campaigns", "Deal-style opportunities from cannabis brands, labeled Paid, Product, or Paid + Product."],
              ["Feed", "Social updates from brands and creators: product launches, completed work, reviews, and new drops."],
              ["Messages", "Coordination for product status, payment, expectations, revisions, and next steps."],
              ["Work", "Accepted campaigns, submissions, approvals, payment/product status, and deadlines."]
            ].map(([label, copy]) => (
              <InternalSubPanel className="p-4" key={label}>
                <div className="text-lg font-black text-[#fbfbf7]">{label}</div>
                <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{copy}</p>
              </InternalSubPanel>
            ))}
          </div>
        </InternalPanel>

        <InternalPanel className="p-5 md:p-6">
          <div className="flex items-center gap-2 text-[#e7ff9a]">
            <BriefcaseBusiness className="h-5 w-5" />
            <InternalEyebrow>Brand side</InternalEyebrow>
          </div>
          <p className="mt-5 text-sm leading-7 text-[#d8ded1]">
            Brands get the same social marketplace presence as creators, plus campaign control: post briefs, review
            applicants, approve content, and confirm payment/product status.
          </p>
          <div className="mt-5 grid gap-3">
            {[MessageCircle, Sparkles].map((Icon, index) => (
              <InternalSubPanel className="p-4" key={index}>
                <Icon className="h-5 w-5 text-[#e7ff9a]" />
                <p className="mt-3 text-sm leading-6 text-[#c7ccc2]">
                  {index === 0
                    ? "Messaging is required because cannabis product logistics cannot rely on normal shipping assumptions."
                    : "Brand profile trust matters because creators evaluate companies before applying."}
                </p>
              </InternalSubPanel>
            ))}
          </div>
        </InternalPanel>
      </section>
    </InternalShell>
  );
}
