import Link from "next/link";
import { BudCastLogo } from "./budcast-logo";

export function InternalShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#030303] px-4 py-5 text-[#fbfbf7] sm:px-6 md:px-10 md:py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_14%_6%,rgba(184,255,61,0.09),transparent_31%),radial-gradient(circle_at_86%_0%,rgba(231,255,154,0.055),transparent_30%),linear-gradient(180deg,#030303,#090706_54%,#030303)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">{children}</div>
    </main>
  );
}

export function InternalTopBar({ label }: { label: string }) {
  return (
    <header className="premium-glass-bar flex items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <BudCastLogo className="brightness-125 contrast-[1.08]" href="/" size="md" variant="mark" />
        <div className="min-w-0">
          <div className="text-sm font-black leading-none text-[#fbfbf7]">BudCast</div>
          <div className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.22em] text-[#aeb5aa]">{label}</div>
        </div>
      </div>
      <Link
        className="inline-flex min-h-10 items-center rounded-full border border-[#e7ff9a]/12 bg-white/[0.055] px-4 text-xs font-black text-[#fbfbf7] transition hover:-translate-y-0.5 hover:border-[#b8ff3d]/32 hover:bg-[#b8ff3d]/10 hover:text-[#e7ff9a]"
        href="/"
      >
        Marketplace
      </Link>
    </header>
  );
}

export function InternalPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[30px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] shadow-[0_24px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

export function InternalSubPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[24px] border border-white/[0.065] bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] ${className}`}>{children}</section>;
}

export function InternalEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7ff9a]">{children}</p>;
}

export function InternalMetric({ detail, label, value }: { detail: string; label: string; value: string | number }) {
  return (
    <InternalPanel className="p-5">
      <InternalEyebrow>{label}</InternalEyebrow>
      <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#fbfbf7]">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{detail}</p>
    </InternalPanel>
  );
}
