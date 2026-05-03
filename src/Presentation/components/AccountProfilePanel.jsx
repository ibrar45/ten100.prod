import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

const GENDERS = [
  { value: '', label: 'Select' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const PhoneField = ({
  label,
  value,
  onChange,
  disabled,
  placeholder = '3XX XXXXXXX',
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="flex gap-2">
      <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-600">
        <span className="text-base leading-none" aria-hidden>
          🇵🇰
        </span>
        <span>+92</span>
      </span>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  </div>
)

export default function AccountProfilePanel({
  form,
  loading,
  saving,
  deleting,
  error,
  successMessage,
  displayName,
  setField,
  onSave,
  onDeleteAccount,
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const disabledForm = loading || saving || deleting
  const emailDisplay = form.email

  useEffect(() => {
    if (!deleteModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !deleting) setDeleteModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [deleteModalOpen, deleting])

  return (
    <div className="mx-auto max-w-4xl">
      {loading && (
        <p className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Loading profile…
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-stone-100/90 shadow-sm">
        <div className="border-b border-slate-200/50">
          <div
            className="flex flex-col items-center px-6 pb-5 pt-8"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #a8b0b8 0%, #7a8490 50%, #5c6570 100%)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white/95 bg-slate-300 shadow-lg">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600 text-2xl font-bold text-white">
                  {displayName
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'U'}
                </div>
              </div>
              <div className="text-left">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300/80 bg-slate-200/60 text-xs font-bold text-slate-800 shadow-sm">
                    I
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-200">
                    Individual
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-stone-100/95 px-6 py-3 text-center">
            <h1 className="text-base font-bold text-slate-900 sm:text-lg">
              {displayName}
            </h1>
          </div>
        </div>

        <form
          className="space-y-6 p-5 sm:p-7"
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
        >
          <h2 className="text-base font-semibold text-slate-800">
            Additional Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setField('firstName')(e.target.value)}
                disabled={disabledForm}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Last name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setField('lastName')(e.target.value)}
                disabled={disabledForm}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={emailDisplay}
                readOnly
                className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
              />
            </div>
            <PhoneField
              label="Mobile"
              value={form.phoneLocal}
              onChange={setField('phoneLocal')}
              disabled={disabledForm}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setField('gender')(e.target.value)}
                disabled={disabledForm}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-100"
              >
                {GENDERS.map((g) => (
                  <option key={g.value || 'empty'} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Date of birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setField('dateOfBirth')(e.target.value)}
                disabled={disabledForm}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Street
              </label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setField('street')(e.target.value)}
                disabled={disabledForm}
                placeholder="House / street"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setField('city')(e.target.value)}
                disabled={disabledForm}
                placeholder="City"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setField('state')(e.target.value)}
                disabled={disabledForm}
                placeholder="State / province"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Zip code
              </label>
              <input
                type="text"
                value={form.zipCode}
                onChange={(e) => setField('zipCode')(e.target.value)}
                disabled={disabledForm}
                placeholder="54000"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-4">
            <p className="text-sm font-medium text-slate-700">Upload a picture</p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                <ImagePlus className="h-8 w-8 text-slate-400" />
              </div>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-500 opacity-60"
              >
                <Upload className="h-4 w-4" />
                Upload or select new picture
              </button>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200/80 pt-5">
            <button
              type="submit"
              disabled={disabledForm}
              className="rounded-lg bg-emerald-900 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-950 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-stone-100/90 p-5 shadow-sm sm:p-7">
        <h2 className="text-base font-semibold text-slate-800">Delete account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Permanently delete your account. This action may mark your account as
          deleted on the server (soft delete).
        </p>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          disabled={disabledForm}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-800 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete my account
        </button>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden
            onClick={() => {
              if (!deleting) setDeleteModalOpen(false)
            }}
          />
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
            <h3
              id="delete-account-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete account?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              This will soft-delete your account on the server. You will be signed
              out. This action cannot be undone from here.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void onDeleteAccount()
                }}
                disabled={deleting}
                className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
