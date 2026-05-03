import { Heart } from 'lucide-react'

export default function SaveButton({
  isSaved,
  pending,
  onToggle,
  className = '',
  size = 18,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-label={isSaved ? 'Remove from saved' : 'Save hostel'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm transition ${
        pending ? 'opacity-60' : 'hover:scale-110 hover:bg-white active:scale-95'
      } ${className}`}
    >
      <Heart
        size={size}
        className={`transition-transform duration-200 ${isSaved ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600'}`}
      />
    </button>
  )
}