export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="shimmer h-44" />
      <div className="space-y-2 p-4">
        <div className="shimmer h-4 w-2/3 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="shimmer h-8 w-full rounded" />
      </div>
    </div>
  )
}
