import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CreateRoomForm from '../components/CreateRoomForm'
import AppHeader from '../../shared/components/AppHeader'
import { useAuth } from '../../shared/context/useAuth'
import { publishHostel, createRoom } from '../../features/hostels'

const initialForm = {
  roomNo: '',
  floorNumber: '1',
  totalSeats: '1',
  availableSeats: '1',
  rentPerBed: '',
  rentPerBedPerDay: '',
  securityDeposit: '',
  sharingType: '1',
  attachedBath: false,
  acAvailable: false,
  geyserAvailable: false,
  roomType: 'single',
  furnishing: 'unfurnished',
  hasBalcony: false,
  hasWifi: false,
  status: 'available',
  notes: '',
  imageUrlsText: '',
}

const toNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export default function CreateRoomView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { hostelId } = useParams()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resultData, setResultData] = useState(null)

  const imageUrls = useMemo(
    () =>
      form.imageUrlsText
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
    [form.imageUrlsText],
  )
  const bedPreviewCount = Math.max(toNum(form.totalSeats, 1), 1)

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isShortStayAvailable = Boolean(
    location.state?.createdHostel?.isShortStayAvailable,
  )

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setResultData(null)

    if (!hostelId) {
      setError('Hostel id is missing.')
      return
    }
    if (!form.roomNo.trim()) {
      setError('Room number is required.')
      return
    }
    if (imageUrls.length === 0) {
      setError('Please add at least one room image URL.')
      return
    }
    if (isShortStayAvailable && toNum(form.rentPerBedPerDay, 0) <= 0) {
      setError('Rent Per Bed (Per Day) is required and must be greater than 0.')
      return
    }

    const payload = {
      roomNo: form.roomNo.trim(),
      floorNumber: toNum(form.floorNumber, 1),
      totalSeats: toNum(form.totalSeats, 1),
      availableSeats: toNum(form.availableSeats, 1),
      rentPerBed: toNum(form.rentPerBed, 0),
      securityDeposit: toNum(form.securityDeposit, 0),
      sharingType: toNum(form.sharingType, 1),
      attachedBath: Boolean(form.attachedBath),
      acAvailable: Boolean(form.acAvailable),
      geyserAvailable: Boolean(form.geyserAvailable),
      roomType: form.roomType.trim() || 'single',
      furnishing: form.furnishing.trim() || 'unfurnished',
      hasBalcony: Boolean(form.hasBalcony),
      hasWifi: Boolean(form.hasWifi),
      status: form.status.trim() || 'available',
      notes: form.notes.trim(),
      images: imageUrls,
    }
    if (isShortStayAvailable) {
      payload.rentPerBedPerDay = toNum(form.rentPerBedPerDay, 0)
    }

    setLoading(true)
    try {
      await createRoom(hostelId, payload)
      const publishResponse = await publishHostel(hostelId)
      setSuccessMessage(
        publishResponse?.message || 'Room created and hostel published successfully.',
      )
      setResultData(publishResponse?.data || null)
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

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 px-5 py-5 sm:px-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Add Room to Hostel
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Hostel ID: <span className="font-medium text-slate-700">{hostelId}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Short-term stay:{' '}
                <span
                  className={`font-semibold ${
                    isShortStayAvailable ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  {isShortStayAvailable ? 'Enabled' : 'Disabled'}
                </span>
              </p>
            </div>
            <div className="rounded-full bg-emerald-100/60 px-4 py-2 text-xs font-semibold text-emerald-800">
              Create Room
            </div>
          </div>

          <CreateRoomForm
            form={form}
            setField={setField}
            isShortStayAvailable={isShortStayAvailable}
            bedPreviewCount={bedPreviewCount}
            loading={loading}
            error={error}
            successMessage={successMessage}
            onSubmit={onSubmit}
            onCancel={() => navigate(user?.role === 'owner' ? '/owner/listings' : '/hostels')}
            cancelLabel={user?.role === 'owner' ? 'Back to my listings' : 'Back to listings'}
            submitLabel="Create Room & Publish Hostel"
          />
        </section>

        {resultData && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="text-base font-semibold text-slate-900">
                Room created and hostel published
              </h3>
            </div>
            <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  )
}

