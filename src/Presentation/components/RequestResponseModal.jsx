export default function RequestResponseModal({
  open,
  mode,
  note,
  onNoteChange,
  loading,
  error,
  onClose,
  onConfirm,
}) {
  if (!open) return null

  const isAccept = mode === 'accepted'
  const heading = isAccept ? 'Confirm Accept' : 'Confirm Reject'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">Respond to Request</h3>
        <p className="mt-1 text-sm text-slate-500">
          Add a note (optional) before sending your response.
        </p>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={isAccept ? 'Approved...' : 'No availability'}
          rows={4}
          className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500"
          disabled={loading}
        />
        {error ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              isAccept ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            {loading ? 'Saving...' : heading}
          </button>
        </div>
      </div>
    </div>
  )
}
