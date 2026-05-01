export default function AppLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-[28px] border border-white/60 bg-white/70 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.18)]"
        />
      ))}
    </div>
  );
}
