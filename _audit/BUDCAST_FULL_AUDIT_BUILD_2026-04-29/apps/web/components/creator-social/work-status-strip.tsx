export type WorkStatusItem = {
  label: string;
  value: string | number;
};

export type WorkStatusStripProps = {
  items: WorkStatusItem[];
};

export function WorkStatusStrip({ items }: WorkStatusStripProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          className="min-w-0 rounded-[18px] bg-white/[0.045] px-3 py-3 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
          key={item.label}
        >
          <div className="text-[25px] font-black leading-none text-[#fbfbf7]">{item.value}</div>
          <div className="mt-1 text-[8px] font-black uppercase tracking-[0.05em] text-[#aeb5aa]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
