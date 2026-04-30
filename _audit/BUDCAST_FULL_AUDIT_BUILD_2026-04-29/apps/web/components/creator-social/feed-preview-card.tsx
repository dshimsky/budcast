export type FeedPreviewCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  meta: string;
};

export function FeedPreviewCard({ eyebrow, title, body, meta }: FeedPreviewCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-[#0b0907] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.32)]">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">{eyebrow}</div>
      <h3 className="mt-3 text-xl font-black leading-tight text-[#fbfbf7]">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-[#bfb1a6]">{body}</p>
      <div className="mt-4 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-[#aeb5aa]">
        {meta}
      </div>
    </article>
  );
}
