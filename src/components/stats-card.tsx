export function StatsCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/85 p-5 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-semibold text-slate-950">{value}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>Live</span>
      </div>
    </div>
  );
}
