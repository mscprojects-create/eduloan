export function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 text-sm text-zinc-400">{d.label}</div>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-white/[0.03]">
            <div
              className="flex h-full items-center justify-end rounded-md px-2 text-xs font-medium text-white transition-all"
              style={{ width: `${Math.max(6, (d.value / max) * 100)}%`, backgroundColor: d.color }}
            >
              {d.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
