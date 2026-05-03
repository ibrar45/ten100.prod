import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PhoneCall,
  User,
  Bath,
  Flame,
  Snowflake,
  Wifi,
} from 'lucide-react'
import { useHostelDetailsViewModel } from '../hooks/useHostelDetailsViewModel'
import AppHeader from '../../shared/components/AppHeader'
import RequestVisitModal from '../components/RequestVisitModal'
import { requestHostelRoom } from '../../features/hostels'
import { useAuth } from '../../shared/context/useAuth'

const bedStatusClass = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'available') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (s === 'occupied') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (s === 'blocked') return 'border-slate-300 bg-slate-100 text-slate-700'
  return 'border-slate-200 bg-white text-slate-700'
}

const RoomFeature = ({ label, active, icon }) => (
  <div className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center shadow-sm">
    <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700">
      {icon}
    </div>
    <p className="text-[11px] font-semibold text-slate-700">{label}</p>
    <p className="text-[11px] text-slate-500">({active ? 'Yes' : 'No'})</p>
  </div>
)

export default function HostelDetailsView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { details, roomsWithBeds, loading, error, mapQuery } = useHostelDetailsViewModel()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [requestMessage, setRequestMessage] = useState(
    'Hi, I am interested in this room. Can I visit?',
  )
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [requestedRoomIds, setRequestedRoomIds] = useState([])

  if (loading) {
    return (
      <main className="px-4 py-6">
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Loading hostel details...
        </p>
      </main>
    )
  }

  if (error || !details) {
    return (
      <main className="px-4 py-6">
        <button
          type="button"
          onClick={() => navigate('/hostels')}
          className="mb-4 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'No hostel details found'}
        </p>
      </main>
    )
  }

  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`
  const images = details.images?.length ? details.images : ['/src/assets/hero.png']
  const image = images[activeImageIndex] || images[0]
  const openRoomBedDetails = (room) =>
    navigate(`/beds/${details.id}/${room.id}/1`)
  const isOwnerOfHostel =
    Boolean(user?.id) && Boolean(details?.owner?.id) && user.id === details.owner.id
  const isOwnerUser = user?.role === 'owner' || user?.role === 'hostel_owner'
  const ownerPhone = details.owner?.profile?.phoneNumber || details.contact?.phone || ''
  const whatsappLink = (() => {
    const digits = ownerPhone.replace(/\D/g, '')
    if (!digits) return '#'
    return `https://wa.me/${digits}`
  })()

  const openRequestModal = (room) => {
    if (isOwnerOfHostel) return
    setSelectedRoom(room)
    setRequestError('')
    setRequestModalOpen(true)
  }

  const closeRequestModal = () => {
    if (requestLoading) return
    setRequestModalOpen(false)
    setSelectedRoom(null)
    setRequestError('')
  }

  const submitRoomRequest = async () => {
    if (!selectedRoom?.id) return
    const trimmed = requestMessage.trim()
    if (!trimmed) {
      setRequestError('Message is required.')
      return
    }
    if (trimmed.length > 2000) {
      setRequestError('Message must be 2000 characters or less.')
      return
    }

    setRequestError('')
    setRequestLoading(true)
    try {
      await requestHostelRoom(details.id, selectedRoom.id, { message: trimmed })
      setRequestedRoomIds((prev) =>
        prev.includes(selectedRoom.id) ? prev : [...prev, selectedRoom.id],
      )
      setRequestSuccess('Request sent successfully')
      setRequestModalOpen(false)
      setSelectedRoom(null)
    } catch (submitError) {
      if (submitError?.status === 401) {
        navigate('/login', {
          state: {
            from: `${location.pathname}${location.search}${location.hash}`,
          },
        })
        return
      }
      if (submitError?.status === 409) {
        setRequestError('You already requested this room')
        return
      }
      setRequestError(submitError?.message || 'Failed to send request')
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-screen-2xl px-4 py-6">
        {requestSuccess && (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {requestSuccess}
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate('/hostels')}
          className="mb-4 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <ArrowLeft size={14} />
          Back to listings
        </button>

      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        {details.name} - Details
      </h1>
      <p className="mt-1 text-sm font-medium text-slate-600">
        Home &gt; Hostels &gt; {details.name}
      </p>

      <section className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_1.05fr]">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            <img
              src={image}
              alt={details.name}
              className="h-[460px] w-full object-cover transition-all duration-500"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
                  }
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow transition hover:bg-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow transition hover:bg-white"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(0, 8).map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`overflow-hidden rounded-xl border transition ${
                    index === activeImageIndex
                      ? 'border-teal-700 ring-2 ring-teal-200'
                      : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt={`${details.name}-${index + 1}`} className="h-16 w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <section className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
            <h3 className="text-3xl font-semibold text-slate-900">Hostel Information</h3>
            <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <p className="font-semibold text-slate-700">Hostel Name</p>
              <p>{details.name}</p>
              <p className="font-semibold text-slate-700">Address</p>
              <p>
                {details.address.street}, {details.address.area}, {details.address.city}
              </p>
              <p className="font-semibold text-slate-700">Policies</p>
              <p className="capitalize">{details.genderPolicy}</p>
              <p className="font-semibold text-slate-700">Short Stay</p>
              <p>
                {details.isShortStayAvailable ? (
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Short Stay Available
                  </span>
                ) : (
                  'Not available'
                )}
              </p>
              <p className="font-semibold text-slate-700">Total Floors</p>
              <p>{details.totalFloors}</p>
              <p className="font-semibold text-slate-700">Total Rooms</p>
              <p>{details.totalRoomCount}</p>
              <p className="font-semibold text-slate-700">Total Available Seats</p>
              <p>{details.totalAvailableSeats}</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Rating: {details.ratingAverage?.toFixed?.(1) ?? '0.0'}
            </p>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <iframe
              title={`Map for ${details.name}`}
              src={mapUrl}
              className="h-[220px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>

          <section className="grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
  {/* Section Title */}
  <h3 className="text-xl font-bold text-slate-800 mb-3">Contact Host</h3>

  <div className="flex items-center justify-between">
    {/* Left Side: Avatar and Info */}
    <div className="flex items-center gap-3">
      {/* Profile Placeholder/Avatar */}
      <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
        {details.owner?.profile?.profilePicture ? (
          <img 
            src={details.owner.profile.profilePicture} 
            alt="Owner" 
            className="h-full w-full object-cover"
          />
        ) : (
          <User size={32} fill="currentColor" className="opacity-40" />
        )}
      </div>

      {/* Name and Role */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Owner</p>
        <p className="text-lg font-extrabold text-slate-900 leading-tight">
          {details.owner?.profile?.firstName || 'Hostel'} {details.owner?.profile?.lastName || 'Owner'}
        </p>
      </div>
    </div>

    {/* Right Side: Action Button */}
    <button className="rounded-xl border-2 border-teal-800/30 bg-slate-100 px-6 py-2.5 text-sm font-bold text-teal-900 transition-colors hover:bg-teal-800 hover:text-white">
      Contact Host
    </button>
  </div>
</article>

            <article className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
              <h3 className="text-3xl font-semibold text-slate-900">Hostel Rules</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {details.rules.length > 0 ? (
                  details.rules.map((rule) => <li key={rule}>{rule}</li>)
                ) : (
                  <li>No special rules listed.</li>
                )}
              </ul>
              <h4 className="mt-3 text-sm font-semibold text-slate-800">Amenities</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {(details.amenities.length ? details.amenities : ['none']).map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </article>
          </section>

          <aside className="sticky top-24 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Contact Panel</h3>
            <p className="mt-1 text-sm text-slate-600">
              Reach the owner instantly for availability and booking details.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
              <a
                href={ownerPhone ? `tel:${ownerPhone}` : '#'}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                <PhoneCall size={15} /> Call
              </a>
            </div>
          </aside>
        </div>
      </section>

    <section className="mt-8 space-y-4">
  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 px-1">
    Available Rooms
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {roomsWithBeds.map((room) => (
      <article
        key={room.id}
        className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:shadow-md"
      >
        {/* Header: Matches the "top-cap" grey bar in your image */}
        <div className="flex items-center justify-between bg-slate-100 px-5 py-3 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">
            Room No: {room.roomNo}
          </h3>
          <p className="text-lg font-semibold text-slate-700">
            Status: <span className="text-emerald-700 font-bold">{room.status}</span>
          </p>
        </div>

        <div className="p-5">
          {/* Details Grid: Matches the 2-column layout in the image */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-slate-800 font-medium">
                Rent: <span className="text-emerald-800 font-bold">PKR {room.rentPerBed.toLocaleString()} / month</span>
              </p>
              {details.isShortStayAvailable && room.rentPerBedPerDay > 0 && (
                <p className="text-slate-700">
                  Per Day: <span className="font-semibold text-slate-900">PKR {room.rentPerBedPerDay.toLocaleString()} / day</span>
                </p>
              )}
              <p className="text-slate-700">
                Security Deposit: <span className="font-semibold text-slate-900">PKR {room.securityDeposit}</span>
              </p>
            </div>
            <div className="text-right md:text-left">
              <p className="text-slate-800 font-semibold">{room.floorNumber} Floor</p>
              <p className="text-slate-700">
                Furnishing: <span className="font-semibold text-slate-900 capitalize">{room.furnishing}</span>
              </p>
            </div>
          </div>

          {/* Features Row: Centered vertical stack like the icons in your image */}
          <div className="mt-6 grid grid-cols-4 gap-2 border-t border-slate-50 pt-4">
            <RoomFeature label="Attached Bath" active={room.attachedBath} icon={<Bath size={18} />} />
            <RoomFeature label="Air Conditioning" active={room.acAvailable} icon={<Snowflake size={18} />} />
            <RoomFeature label="Geyser" active={room.geyserAvailable} icon={<Flame size={18} />} />
            <RoomFeature label="WiFi" active={room.hasWifi} icon={<Wifi size={18} />} />
          </div>

          {room.beds?.length > 0 ? (
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Beds in this room ({room.beds.length})
              </p>
              <ul className="flex flex-wrap gap-2">
                {room.beds.map((bed) => (
                  <li key={bed.id || `${room.id}-bed-${bed.bedNo}`}>
                    <button
                      type="button"
                      onClick={() => navigate(`/beds/${details.id}/${room.id}/${bed.bedNo}`)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow ${bedStatusClass(bed.status)}`}
                    >
                      <span className="font-semibold text-slate-900">Bed {bed.bedNo}</span>
                      <span className="text-xs capitalize">{bed.status}</span>
                      {typeof bed.listed === 'boolean' ? (
                        <span className="text-[10px] text-slate-500">
                          {bed.listed ? '· Listed' : '· Hidden'}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No bed breakdown available for this room.</p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openRoomBedDetails(room)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Beds
            </button>
            {!isOwnerUser && !isOwnerOfHostel && (
              <button
                type="button"
                disabled={requestedRoomIds.includes(room.id) || (!isAuthenticated && requestLoading)}
                onClick={() => openRequestModal(room)}
                className="rounded-xl bg-teal-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestedRoomIds.includes(room.id) ? 'Request Sent' : 'Request Visit'}
              </button>
            )}
          </div>
        </div>
      </article>
    ))}
  </div>
        </section>
      </main>
      <RequestVisitModal
        open={requestModalOpen}
        roomNo={selectedRoom?.roomNo}
        message={requestMessage}
        setMessage={setRequestMessage}
        loading={requestLoading}
        error={requestError}
        onClose={closeRequestModal}
        onSubmit={submitRoomRequest}
      />
    </div>
  )
}
