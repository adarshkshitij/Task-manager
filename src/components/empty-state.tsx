import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/30 p-10 text-center transition-all duration-300 hover:bg-slate-50/50 hover:border-slate-300">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-100 mb-5">
        <Inbox className="h-6 w-6 text-slate-300" />
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="mt-2 max-w-[240px] text-xs font-medium text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
