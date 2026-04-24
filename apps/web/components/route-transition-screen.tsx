import { Card } from "./ui/card";

export function RouteTransitionScreen({
  eyebrow = "Loading",
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <main className="grid-overlay min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Card className="hero-orbit soft-panel animate-enter overflow-hidden p-8 md:p-10">
          <div className="premium-badge">
            <span className="signal-dot" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">{eyebrow}</div>
              <div className="text-sm font-medium text-surface-900">BudCast route transition</div>
            </div>
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[0.96] text-surface-900 md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">{description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Session check", "Profile hydration", "Route handoff"].map((item, index) => (
              <div className={`premium-chip ${index === 1 ? "animate-float" : ""}`} key={item}>
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
