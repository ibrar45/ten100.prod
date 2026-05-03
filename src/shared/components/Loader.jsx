export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[24vh] flex-col items-center justify-center gap-3">
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)]" />
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
    </div>
  )
}
