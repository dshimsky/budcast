import { cn } from "../../lib/utils";

export type MetadataItem = {
  id?: string;
  label: string;
  value: string;
};

export type MetadataStripProps = {
  className?: string;
  items: MetadataItem[];
};

export function MetadataStrip({ className, items }: MetadataStripProps) {
  if (items.length === 0) return null;

  return (
    <dl className={cn("grid gap-2 border-t border-white/[0.065] pt-4 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <div
          key={item.id ?? `${item.label}-${item.value}`}
          className="min-w-0 rounded-[18px] bg-white/[0.028] px-3 py-3 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]"
        >
          <dt className="truncate text-sm font-black text-[#fbfbf7]">{item.value}</dt>
          <dd className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#83766e]">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}
