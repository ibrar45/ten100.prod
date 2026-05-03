export default function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-slate-50 px-4">
      <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3 w-40 animate-pulse rounded-full bg-slate-200" />
      <p className="text-xs text-slate-500">Loading…</p>
    </div>
  )
}
