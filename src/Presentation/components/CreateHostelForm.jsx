const Field = ({ label, helper, children }) => (
  <label className="space-y-1.5">
    <p className="text-sm font-medium text-slate-800">{label}</p>
    {children}
    {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
  </label>
)

const InputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-slate-300 transition focus:ring-2'

export default function CreateHostelForm({
  form,
  setField,
  presetAmenities = [],
  presetRules = [],
  togglePresetAmenity,
  addCustomAmenity,
  removeCustomAmenityAt,
  togglePresetRule,
  addCustomRule,
  removeCustomRuleAt,
  completion,
  selectedPreviewUrls,
  onFileChange,
  loading,
  error,
  successMessage,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Listing completion</p>
          <p className="text-sm font-semibold text-teal-800">{completion}%</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Hostel Name" helper="Use a clear public name tenants can search easily.">
            <input
              value={form.name}
              onChange={(e) => setField('name')(e.target.value)}
              placeholder="e.g. Lahore View Hostel"
              className={InputClass}
            />
          </Field>
          <Field label="Hostel Code (optional)" helper="Internal reference code for your own tracking.">
            <input
              value={form.code}
              onChange={(e) => setField('code')(e.target.value)}
              placeholder="e.g. LVH-01"
              className={InputClass}
            />
          </Field>
          <Field label="Who is this hostel for?" helper="Choose the tenant category for this property.">
            <select
              value={form.genderPolicy}
              onChange={(e) => setField('genderPolicy')(e.target.value)}
              className={InputClass}
            >
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="mixed">Mixed</option>
            </select>
          </Field>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-slate-800">Enable Short-Term Stay</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Allows daily rent setup when you add rooms.
            </p>
            <button
              type="button"
              onClick={() => setField('isShortStayAvailable')(!form.isShortStayAvailable)}
              className={`mt-2 inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
                form.isShortStayAvailable ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              aria-pressed={form.isShortStayAvailable}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  form.isShortStayAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <Field label="Total Floors" helper="Enter total number of floors in this hostel.">
            <input
              type="number"
              min="1"
              value={form.totalFloors}
              onChange={(e) => setField('totalFloors')(e.target.value)}
              placeholder="e.g. 4"
              className={InputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Contact Info</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Primary Phone Number" helper="Main number tenants will use to contact you.">
            <input
              value={form.contactPhone}
              onChange={(e) => setField('contactPhone')(e.target.value)}
              placeholder="+92 300 1234567"
              className={InputClass}
            />
          </Field>
          <Field label="Alternate Phone (optional)" helper="Backup number in case primary is unavailable.">
            <input
              value={form.contactAlternatePhone}
              onChange={(e) => setField('contactAlternatePhone')(e.target.value)}
              placeholder="+92 301 1234567"
              className={InputClass}
            />
          </Field>
          <Field label="Contact Email" helper="Used for booking follow-up and notifications.">
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setField('contactEmail')(e.target.value)}
              placeholder="owner@example.com"
              className={InputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="City">
            <input
              value={form.city}
              onChange={(e) => setField('city')(e.target.value)}
              placeholder="Lahore"
              className={InputClass}
            />
          </Field>
          <Field label="Area">
            <input
              value={form.area}
              onChange={(e) => setField('area')(e.target.value)}
              placeholder="Johar Town"
              className={InputClass}
            />
          </Field>
          <Field label="Street">
            <input
              value={form.street}
              onChange={(e) => setField('street')(e.target.value)}
              placeholder="Street 12"
              className={InputClass}
            />
          </Field>
          <Field label="Full Address" helper="Landmark + building details for easier navigation.">
            <input
              value={form.fullAddress}
              onChange={(e) => setField('fullAddress')(e.target.value)}
              placeholder="House 45, Block A, Johar Town"
              className={InputClass}
            />
          </Field>
          <Field label="Postal Code">
            <input
              value={form.pincode}
              onChange={(e) => setField('pincode')(e.target.value)}
              placeholder="54000"
              className={InputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Amenities</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-800">Common amenities</p>
            <p className="mt-0.5 text-xs text-slate-500">Select everything that applies.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {presetAmenities.map((name) => (
                <label
                  key={name}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={form.selectedAmenities?.includes(name) ?? false}
                    onChange={() => togglePresetAmenity?.(name)}
                    className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Custom amenities</p>
            <p className="mt-0.5 text-xs text-slate-500">Add anything not listed above.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(form.customAmenities || []).map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeCustomAmenityAt?.(index)}
                    className="rounded-full px-1 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={form.customAmenityDraft ?? ''}
                onChange={(e) => setField('customAmenityDraft')(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomAmenity?.()
                  }
                }}
                placeholder="e.g. Rooftop terrace"
                className={`${InputClass} sm:flex-1`}
              />
              <button
                type="button"
                onClick={() => addCustomAmenity?.()}
                className="h-10 shrink-0 rounded-xl border border-slate-800 bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-900"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
          <div>
            <p className="text-sm font-medium text-slate-800">Hostel rules</p>
            <p className="mt-0.5 text-xs text-slate-500">Select standard rules, then add your own if needed.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-1 lg:grid-cols-2">
              {presetRules.map((name) => (
                <label
                  key={name}
                  className="inline-flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={form.selectedRules?.includes(name) ?? false}
                    onChange={() => togglePresetRule?.(name)}
                    className="mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Custom rules</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(form.customRules || []).map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeCustomRuleAt?.(index)}
                    className="rounded-full px-1 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={form.customRuleDraft ?? ''}
                onChange={(e) => setField('customRuleDraft')(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomRule?.()
                  }
                }}
                placeholder="e.g. No cooking in bedrooms"
                className={`${InputClass} sm:flex-1`}
              />
              <button
                type="button"
                onClick={() => addCustomRule?.()}
                className="h-10 shrink-0 rounded-xl border border-slate-800 bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-900"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Images</h2>
        <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-teal-500 hover:bg-teal-50/40">
          <input type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
          <p className="text-sm font-semibold text-slate-700 transition group-hover:text-teal-800">
            Upload hostel photos
          </p>
          <p className="mt-1 text-xs text-slate-500">Up to 10 images, max 5MB each</p>
        </label>
        {selectedPreviewUrls.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {selectedPreviewUrls.map((item) => (
              <div key={item.name} className="overflow-hidden rounded-lg border border-slate-200">
                <img src={item.url} alt={item.name} className="h-24 w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create Hostel'}
        </button>
      </div>
    </form>
  )
}
