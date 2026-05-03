export default function RequestVisitModal({
  open,
  roomNo,
  message,
  setMessage,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const maxLength = 2000

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4 transition-opacity duration-200 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all duration-200 ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Request a visit"
      >
        <h3 className="text-xl font-semibold text-slate-900">Request a Visit</h3>
        <p className="mt-1 text-sm text-slate-500">
          Room {roomNo}: Write your request for the hostel owner.
        </p>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={maxLength}
          rows={5}
          placeholder="Write your message (e.g. I want to visit next week...)"
          className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
        />

        <div className="mt-1 text-right text-xs text-slate-500">
          {message.length}/{maxLength}
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex min-w-28 items-center justify-center rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
