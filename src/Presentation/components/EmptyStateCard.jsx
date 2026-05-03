export default function EmptyStateCard({
  icon,
  title,
  subtitle,
  actionLabel,
  onActionClick,
}) {
  return (
    <article className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onActionClick}
          className="mt-4 rounded-xl bg-teal-800 px-4 py-2 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  )
}
