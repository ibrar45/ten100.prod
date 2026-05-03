export default function OwnerStatsCard({ label, value, hint, icon, tone = 'teal' }) {
  const toneClass =
    tone === 'rose'
      ? 'bg-rose-50 text-rose-700'
      : tone === 'amber'
        ? 'bg-amber-50 text-amber-700'
        : tone === 'blue'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-teal-50 text-teal-700'

  return (
    <article className="hover-lift rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className={`rounded-xl p-2 ${toneClass}`}>{icon}</div>
      </div>
    </article>
  )
}
