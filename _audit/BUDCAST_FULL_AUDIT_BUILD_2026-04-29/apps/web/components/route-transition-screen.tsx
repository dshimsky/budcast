import Link from "next/link";

export function RouteTransitionScreen({
  eyebrow = "Loading",
  title,
  description,
  primaryAction,
  secondaryAction
}: {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
}) {
  return (
    <main className="min-h-screen bg-[#030303] px-6 py-10 text-[#fbfbf7] md:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(184,255,61,0.12),transparent_32%),linear-gradient(180deg,#030303,#090706_54%,#030303)]" />
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="animate-enter overflow-hidden rounded-[34px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] p-8 shadow-[0_28px_90px_rgba(0,0,0,0.44),0_1px_0_rgba(255,255,255,0.06)_inset] md:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#b8ff3d]/22 bg-[#b8ff3d]/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#b8ff3d] shadow-[0_0_18px_rgba(184,255,61,0.72)]" />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-[#e7ff9a]">{eyebrow}</div>
              <div className="text-sm font-black text-[#fbfbf7]">BudCast route transition</div>
            </div>
          </div>
          <h1 className="mt-6 text-5xl font-black leading-[0.9] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#d8ded1]">{description}</p>
          {primaryAction || secondaryAction ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {primaryAction ? (
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-5 text-sm font-black text-[#071007] shadow-[0_18px_44px_rgba(184,255,61,0.24),0_1px_0_rgba(255,255,255,0.28)_inset] transition hover:-translate-y-0.5 hover:bg-[#d7ff72]"
                  href={primaryAction.href}
                >
                  {primaryAction.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] px-5 text-sm font-black text-[#fbfbf7] transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.08]"
                  href={secondaryAction.href}
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {["Session check", "Profile hydration", "Route handoff"].map((item, index) => (
              <div
                className={`rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#c7ccc2] ${index === 1 ? "animate-float" : ""}`}
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
