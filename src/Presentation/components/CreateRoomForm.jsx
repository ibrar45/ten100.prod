const Field = ({ label, helper, children }) => (
  <label className="space-y-1.5">
    <p className="text-sm font-medium text-slate-800">{label}</p>
    {children}
    {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
  </label>
)

const InputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-slate-300 transition focus:ring-2'

export default function CreateRoomForm({
  form,
  setField,
  isShortStayAvailable,
  bedPreviewCount,
  loading,
  error,
  successMessage,
  onSubmit,
  onCancel,
  cancelLabel,
  submitLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Room Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Room Number" helper="Example: 101, A-12, Ground-01">
            <input
              value={form.roomNo}
              onChange={(e) => setField('roomNo')(e.target.value)}
              placeholder="e.g. 101"
              className={InputClass}
            />
          </Field>
          <Field label="Floor Number">
            <input
              type="number"
              min="1"
              value={form.floorNumber}
              onChange={(e) => setField('floorNumber')(e.target.value)}
              placeholder="1"
              className={InputClass}
            />
          </Field>
          <Field label="Total Beds">
            <input
              type="number"
              min="1"
              value={form.totalSeats}
              onChange={(e) => setField('totalSeats')(e.target.value)}
              placeholder="3"
              className={InputClass}
            />
          </Field>
          <Field label="Monthly Rent per Bed">
            <input
              type="number"
              min="0"
              value={form.rentPerBed}
              onChange={(e) => setField('rentPerBed')(e.target.value)}
              placeholder="15000"
              className={InputClass}
            />
          </Field>
          {isShortStayAvailable ? (
            <Field label="Daily Rent per Bed">
              <input
                type="number"
                min="1"
                value={form.rentPerBedPerDay}
                onChange={(e) => setField('rentPerBedPerDay')(e.target.value)}
                placeholder="1200"
                className="h-10 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm outline-none ring-emerald-300 transition focus:ring-2"
              />
            </Field>
          ) : null}
          <Field label="Available Beds">
            <input
              type="number"
              min="0"
              value={form.availableSeats}
              onChange={(e) => setField('availableSeats')(e.target.value)}
              placeholder="3"
              className={InputClass}
            />
          </Field>
          <Field label="Security Deposit">
            <input
              type="number"
              min="0"
              value={form.securityDeposit}
              onChange={(e) => setField('securityDeposit')(e.target.value)}
              placeholder="5000"
              className={InputClass}
            />
          </Field>
          <Field label="Room Status">
            <select
              value={form.status}
              onChange={(e) => setField('status')(e.target.value)}
              className={InputClass}
            >
              <option value="available">available</option>
              <option value="full">full</option>
              <option value="maintenance">maintenance</option>
            </select>
          </Field>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {bedPreviewCount} {bedPreviewCount === 1 ? 'bed will be created for this room' : 'beds will be created for this room'}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Room Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Room Type">
            <select
              value={form.roomType}
              onChange={(e) => setField('roomType')(e.target.value)}
              className={InputClass}
            >
              <option value="single">single</option>
              <option value="double">double</option>
              <option value="triple">triple</option>
              <option value="custom">custom</option>
            </select>
          </Field>
          <Field label="Furnishing">
            <select
              value={form.furnishing}
              onChange={(e) => setField('furnishing')(e.target.value)}
              className={InputClass}
            >
              <option value="furnished">furnished</option>
              <option value="semi-furnished">semi-furnished</option>
              <option value="unfurnished">unfurnished</option>
            </select>
          </Field>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.attachedBath}
              onChange={(e) => setField('attachedBath')(e.target.checked)}
            />
            Attached Bath
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.acAvailable}
              onChange={(e) => setField('acAvailable')(e.target.checked)}
            />
            AC Available
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.geyserAvailable}
              onChange={(e) => setField('geyserAvailable')(e.target.checked)}
            />
            Geyser Available
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.hasBalcony}
              onChange={(e) => setField('hasBalcony')(e.target.checked)}
            />
            Has Balcony
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.hasWifi}
              onChange={(e) => setField('hasWifi')(e.target.checked)}
            />
            Has WiFi
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Notes & Images</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes')(e.target.value)}
              rows={5}
              placeholder="Anything tenants should know about this room..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            />
          </Field>
          <Field label="Image URLs" helper="Add one image URL per line.">
            <textarea
              value={form.imageUrlsText}
              onChange={(e) => setField('imageUrlsText')(e.target.value)}
              rows={5}
              placeholder="https://.../room-1.jpg"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            />
          </Field>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700"
        >
          {cancelLabel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 disabled:opacity-60"
        >
          {loading ? 'Creating room…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
