const clampPercent = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export default function CircularProgressCard({
  label,
  thisWeek,
  lastWeek,
  loading = false,
}) {
  const safeLast = Number(lastWeek) || 0
  const safeThis = Number(thisWeek) || 0
  const rawPct = safeLast > 0 ? ((safeThis - safeLast) / safeLast) * 100 : safeThis > 0 ? 100 : 0
  const pct = clampPercent(Math.abs(rawPct))
  const isUp = rawPct >= 0

  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {loading ? (
        <div className="flex items-center justify-center py-2">
          <div className="shimmer h-20 w-20 rounded-full" />
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="84" height="84" className="-rotate-90">
              <circle
                cx="42"
                cy="42"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="42"
                cy="42"
                r={radius}
                stroke={isUp ? '#10b981' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className={`text-sm font-bold ${isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                {Math.abs(rawPct).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}
      <p className="mt-3 text-center text-sm font-semibold text-slate-800">{label}</p>
      <p className="mt-0.5 text-center text-xs text-slate-500">This week vs last week</p>
    </article>
  )
}
