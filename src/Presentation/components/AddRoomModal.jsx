import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { createRoom } from '../../features/hostels'

const MAX_FILE_COUNT = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024

const InputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-slate-300 transition focus:ring-2'

const initialForm = {
  roomNo: '',
  floorNumber: '1',
  totalSeats: '3',
  availableSeats: '3',
  rentPerBed: '15000',
  rentPerBedPerDay: '2000',
  securityDeposit: '5000',
  sharingType: '3',
  attachedBath: true,
  acAvailable: true,
  geyserAvailable: false,
  roomType: 'triple',
  furnishing: 'furnished',
  hasBalcony: false,
  hasWifi: true,
  status: 'available',
  notes: '',
}

const toNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const Field = ({ label, helper, children }) => (
  <label className="space-y-1.5">
    <p className="text-sm font-medium text-slate-800">{label}</p>
    {children}
    {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
  </label>
)

export default function AddRoomModal({
  open,
  onClose,
  hostelId,
  isShortStayAvailable,
  onCreated,
}) {
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  )

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [previews])

  useEffect(() => {
    if (!open) {
      setForm(initialForm)
      setFiles([])
      setError('')
      setLoading(false)
    }
  }, [open])

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validateAndSetFiles = (fileList) => {
    const picked = Array.from(fileList || [])
    if (picked.length === 0) return
    if (files.length + picked.length > MAX_FILE_COUNT) {
      setError(`You can upload up to ${MAX_FILE_COUNT} images only.`)
      return
    }
    for (const file of picked) {
      if (!file.type?.startsWith('image/')) {
        setError(`Only image files are allowed. Invalid file: ${file.name}`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is larger than 5MB.`)
        return
      }
    }
    setError('')
    setFiles((prev) => [...prev, ...picked])
  }

  const removeFileAt = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('roomNo', form.roomNo.trim())
    fd.append('floorNumber', String(toNum(form.floorNumber, 1)))
    fd.append('totalSeats', String(toNum(form.totalSeats, 1)))
    fd.append('availableSeats', String(toNum(form.availableSeats, toNum(form.totalSeats, 1))))
    fd.append('rentPerBed', String(toNum(form.rentPerBed, 0)))
    fd.append('securityDeposit', String(toNum(form.securityDeposit, 0)))
    fd.append('sharingType', String(toNum(form.sharingType, toNum(form.totalSeats, 1))))
    fd.append('attachedBath', String(Boolean(form.attachedBath)))
    fd.append('acAvailable', String(Boolean(form.acAvailable)))
    fd.append('geyserAvailable', String(Boolean(form.geyserAvailable)))
    fd.append('roomType', (form.roomType || 'single').trim())
    fd.append('furnishing', (form.furnishing || 'unfurnished').trim())
    fd.append('hasBalcony', String(Boolean(form.hasBalcony)))
    fd.append('hasWifi', String(Boolean(form.hasWifi)))
    fd.append('status', (form.status || 'available').trim())
    fd.append('notes', form.notes.trim())
    if (isShortStayAvailable) {
      fd.append('rentPerBedPerDay', String(toNum(form.rentPerBedPerDay, 0)))
    }
    files.forEach((file) => fd.append('images', file))
    return fd
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!hostelId) {
      setError('Hostel id is missing.')
      return
    }
    if (!form.roomNo.trim()) {
      setError('Room number is required.')
      return
    }
    if (files.length === 0) {
      setError('Please select at least one room image from your device.')
      return
    }
    if (isShortStayAvailable && toNum(form.rentPerBedPerDay, 0) <= 0) {
      setError('Rent Per Bed (Per Day) is required and must be greater than 0.')
      return
    }

    setLoading(true)
    try {
      await createRoom(hostelId, buildFormData())
      onCreated?.(form.roomNo.trim())
      onClose?.()
    } catch (e) {
      const details = e?.payload?.error?.details
      if (Array.isArray(details) && details.length > 0) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join(' | '))
      } else {
        setError(e?.message || 'Failed to create room')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const bedPreviewCount = Math.max(toNum(form.totalSeats, 1), 1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add room</h2>
            <p className="text-xs text-slate-500">
              Images are uploaded from your device (multipart). Fields match POST{' '}
              <span className="font-mono text-slate-600">/api/hostels/:hostelId/rooms</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Room details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Room number">
                    <input
                      value={form.roomNo}
                      onChange={(e) => setField('roomNo')(e.target.value)}
                      placeholder="201"
                      className={InputClass}
                    />
                  </Field>
                  <Field label="Floor number">
                    <input
                      type="number"
                      min="0"
                      value={form.floorNumber}
                      onChange={(e) => setField('floorNumber')(e.target.value)}
                      className={InputClass}
                    />
                  </Field>
                  <Field label="Total beds">
                    <input
                      type="number"
                      min="1"
                      value={form.totalSeats}
                      onChange={(e) => setField('totalSeats')(e.target.value)}
                      className={InputClass}
                    />
                  </Field>
                  <Field label="Available beds">
                    <input
                      type="number"
                      min="0"
                      value={form.availableSeats}
                      onChange={(e) => setField('availableSeats')(e.target.value)}
                      className={InputClass}
                    />
                  </Field>
                  <Field label="Monthly rent per bed">
                    <input
                      type="number"
                      min="0"
                      value={form.rentPerBed}
                      onChange={(e) => setField('rentPerBed')(e.target.value)}
                      className={InputClass}
                    />
                  </Field>
                  <Field label="Security deposit">
                    <input
                      type="number"
                      min="0"
                      value={form.securityDeposit}
                      onChange={(e) => setField('securityDeposit')(e.target.value)}
                      className={InputClass}
                    />
                  </Field>
                  <Field label="Sharing type" helper="Usually matches beds per room.">
                    <input
                      type="number"
                      min="1"
                      value={form.sharingType}
                      onChange={(e) => setField('sharingType')(e.target.value)}
                      className={InputClass}
                    />
                  </Field>
                  {isShortStayAvailable ? (
                    <Field label="Daily rent per bed">
                      <input
                        type="number"
                        min="1"
                        value={form.rentPerBedPerDay}
                        onChange={(e) => setField('rentPerBedPerDay')(e.target.value)}
                        className={`${InputClass} border-emerald-200 bg-emerald-50`}
                      />
                    </Field>
                  ) : null}
                  <Field label="Status">
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
                <p className="mt-3 text-xs text-slate-600">
                  {bedPreviewCount}{' '}
                  {bedPreviewCount === 1 ? 'bed will be created for this room' : 'beds will be created for this room'}
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Features
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Room type">
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
                    Attached bath
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.acAvailable}
                      onChange={(e) => setField('acAvailable')(e.target.checked)}
                    />
                    AC available
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.geyserAvailable}
                      onChange={(e) => setField('geyserAvailable')(e.target.checked)}
                    />
                    Geyser available
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.hasBalcony}
                      onChange={(e) => setField('hasBalcony')(e.target.checked)}
                    />
                    Has balcony
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

              <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Notes & images
                </h3>
                <Field label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => setField('notes')(e.target.value)}
                    rows={3}
                    placeholder="Corner room, quiet side, etc."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                  />
                </Field>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-800">Room photos</p>
                  <p className="text-xs text-slate-500">
                    Choose files from your computer. Each file is sent as{' '}
                    <span className="font-mono">images</span> (same as hostel creation).
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      validateAndSetFiles(e.target.files)
                      e.target.value = ''
                    }}
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                  />
                  {previews.length > 0 ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {previews.map((p, index) => (
                        <div
                          key={`${p.name}-${index}`}
                          className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                        >
                          <img src={p.url} alt="" className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFileAt(index)}
                            className="w-full border-t border-slate-100 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
            >
              {loading ? 'Adding room…' : 'Add room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
