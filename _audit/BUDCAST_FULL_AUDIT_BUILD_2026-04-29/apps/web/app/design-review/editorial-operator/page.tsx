import Link from "next/link";
import { ArrowLeft, Archive, CheckCircle2, XCircle } from "lucide-react";
import { InternalEyebrow, InternalPanel, InternalShell, InternalSubPanel, InternalTopBar } from "../../../components/internal-console";

export const metadata = {
  title: "BudCast Design Review | Archived Editorial Direction"
};

const decisions = [
  ["Keep", "Premium restraint, strong contrast, and brand-safe cannabis language."],
  ["Retire", "Oversized serif dashboard headings, light cards, gold CTA system, and static SaaS section stacking."],
  ["Replace with", "Campaign/feed/message/work IA, compact social cards, coral actions, and creator/brand identity presence."]
];

export default function EditorialOperatorPage() {
  return (
    <InternalShell>
      <InternalTopBar label="Archived design reference" />

      <InternalPanel className="p-6 md:p-8">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-[#d8ded1] hover:text-[#e7ff9a]" href="/design-review">
          <ArrowLeft className="h-4 w-4" />
          Back to design review
        </Link>
        <InternalEyebrow>Archived comparison</InternalEyebrow>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#fbfbf7] md:text-7xl">
          Editorial Operator is now a reference, not the active product direction.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
          This page exists to document what changed. BudCast moved away from a premium SaaS dashboard toward a social
          cannabis creator marketplace with campaign discovery, feed activity, messaging, and work queues.
        </p>
      </InternalPanel>

      <section className="grid gap-5 lg:grid-cols-3">
        {decisions.map(([title, copy], index) => {
          const Icon = index === 0 ? CheckCircle2 : index === 1 ? XCircle : Archive;
          return (
            <InternalPanel className="p-5" key={title}>
              <Icon className="h-6 w-6 text-[#e7ff9a]" />
              <InternalEyebrow>{title}</InternalEyebrow>
              <p className="mt-3 text-sm leading-7 text-[#d8ded1]">{copy}</p>
            </InternalPanel>
          );
        })}
      </section>

      <InternalSubPanel className="p-5">
        <InternalEyebrow>Design decision</InternalEyebrow>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d8ded1]">
          If a page still looks like this older direction, migrate it to the social marketplace OS before launch.
        </p>
      </InternalSubPanel>
    </InternalShell>
  );
}
