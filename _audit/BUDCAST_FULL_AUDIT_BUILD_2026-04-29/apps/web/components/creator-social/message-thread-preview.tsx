import { MessageCircle } from "lucide-react";

export type MessageThreadPreviewProps = {
  body: string;
  campaignTitle: string;
  status: string;
};

export function MessageThreadPreview({ body, campaignTitle, status }: MessageThreadPreviewProps) {
  return (
    <div className="rounded-[28px] border border-[#b8ff3d]/[0.18] bg-[#b8ff3d]/[0.07] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b8ff3d] text-[#071007]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">{status}</div>
          <h3 className="mt-2 text-lg font-black leading-tight text-[#fbfbf7]">{campaignTitle}</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-[#d8ded1]">{body}</p>
        </div>
      </div>
    </div>
  );
}
