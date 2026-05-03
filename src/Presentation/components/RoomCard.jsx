export default function RoomCard({ room, active = false, onSelect, onEdit }) {
  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Room {room.roomNo || '—'}</p>
          <p className="mt-1 text-xs text-slate-500">Floor {room.floorNumber || 0}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {room.status || 'available'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <p className="rounded-lg bg-slate-50 px-2 py-1 text-slate-700">Total Beds: {room.totalSeats || 0}</p>
        <p className="rounded-lg bg-slate-50 px-2 py-1 text-slate-700">
          Available Beds: {room.availableSeats || 0}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Edit Room
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
        >
          View Beds
        </button>
      </div>
    </article>
  )
}
