const STATUS_STYLES = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  occupied: 'border-rose-200 bg-rose-50 text-rose-700',
  blocked: 'border-slate-300 bg-slate-100 text-slate-700',
}

export default function BedCard({ bed, onToggleListed, onStatusChange, canPersist = true }) {
  const statusClass = STATUS_STYLES[bed.status] || STATUS_STYLES.available

  return (
    <article
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        !canPersist ? 'opacity-90' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Bed #{bed.bedNo}</p>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusClass}`}>
          {bed.status}
        </span>
      </div>

      {!canPersist ? (
        <p className="mt-2 text-xs text-amber-700">Bed ID missing — reload after beds sync from server.</p>
      ) : null}

      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={bed.listed}
          onChange={onToggleListed}
          disabled={!canPersist}
        />
        {bed.listed ? 'Listed' : 'Not Listed'}
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onStatusChange('occupied')}
          disabled={!canPersist}
          className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark Occupied
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('available')}
          disabled={!canPersist}
          className="rounded-lg border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark Available
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('blocked')}
          disabled={!canPersist}
          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Block
        </button>
      </div>
    </article>
  )
}
