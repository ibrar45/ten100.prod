const clampPercent = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export default function DonutChartCard({
  title,
  total,
  pending,
  responded,
  loading = false,
}) {
  const safeTotal = Math.max(Number(total) || 0, 0)
  const safePending = Math.max(Number(pending) || 0, 0)
  const safeResponded = Math.max(Number(responded) || 0, 0)
  const pendingPct = safeTotal > 0 ? clampPercent((safePending / safeTotal) * 100) : 0
  const respondedPct = safeTotal > 0 ? clampPercent((safeResponded / safeTotal) * 100) : 0

  const radius = 44
  const circumference = 2 * Math.PI * radius
  const pendingOffset = circumference - (pendingPct / 100) * circumference
  const respondedOffset = circumference - (respondedPct / 100) * circumference

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {loading ? (
        <div className="mt-4 flex items-center justify-center">
          <div className="shimmer h-28 w-28 rounded-full" />
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-center">
          <div className="relative">
            <svg width="112" height="112" className="-rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#f59e0b"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={pendingOffset}
                strokeLinecap="round"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#10b981"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={respondedOffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900">{safeTotal}</p>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <p className="inline-flex items-center gap-1 text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Pending
        </p>
        <p className="inline-flex items-center gap-1 text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Responded
        </p>
      </div>
    </article>
  )
}
