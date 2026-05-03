import { Check, Clock3, MapPin, X } from 'lucide-react'

const STATUS_TONE = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

export default function RequestCard({ request, onAccept, onReject, busy = false }) {
  const status = request.status || 'pending'
  const isPending = status === 'pending'
  const tenantName = `${request?.tenant?.firstName || ''} ${request?.tenant?.lastName || ''}`.trim()

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isPending ? 'border-amber-200/80 bg-amber-50/30' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900">{tenantName || 'Tenant'}</h4>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock3 size={12} />
            {formatDate(request.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
            STATUS_TONE[status] || STATUS_TONE.pending
          }`}
        >
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700">{request.tenantMessage || 'No message provided.'}</p>

      <p className="mt-3 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{request?.hostel?.name || 'Hostel'}</span>{' '}
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} />
          {[request?.hostel?.city, request?.hostel?.area].filter(Boolean).join(', ') || 'Location unavailable'}
        </span>
      </p>

      {isPending ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            <Check size={14} />
            Accept
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            <X size={14} />
            Reject
          </button>
        </div>
      ) : null}
    </article>
  )
}
