import { Building2 } from 'lucide-react'

export default function EmptyState({
  onCreate,
  title = 'No Listings Yet',
  subtitle = 'Start by creating your first hostel',
  actionLabel = 'Create Property',
  icon,
}) {
  return (
    <div className="col-span-full flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon || <Building2 size={22} />}
      </div>
      <p className="text-lg font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      {onCreate ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 rounded-xl bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-900"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
