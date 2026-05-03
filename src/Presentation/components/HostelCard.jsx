import { Edit3, Eye, MapPin, Megaphone, Trash2 } from 'lucide-react'

const statusTone = (isDraft) =>
  isDraft ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'

export default function HostelCard({
  listing,
  isPublishing,
  isDeleting,
  onView,
  onEdit,
  onPublish,
  onDelete,
}) {
  const isDraft = (listing.listingStatus || '').toLowerCase() !== 'published'
  const roomsCount = Array.isArray(listing.rooms) ? listing.rooms.length : Number(listing.roomsCount) || 0

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.name}
            loading="lazy"
            className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
            <MapPin size={20} />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(
            isDraft,
          )}`}
        >
          {isDraft ? 'Draft' : 'Published'}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{listing.name}</h3>
        <p className="text-sm text-slate-600">Rooms: {roomsCount}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-100"
          >
            <Eye size={14} /> View
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-100"
          >
            <Edit3 size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          {isDraft ? (
            <button
              type="button"
              onClick={onPublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1 rounded-xl bg-teal-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:opacity-60"
            >
              <Megaphone size={14} />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
