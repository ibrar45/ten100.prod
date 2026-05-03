import {
  ArrowLeft,
  Bath,
  BedSingle,
  ChevronLeft,
  ChevronRight,
  Flame,
  MessageCircle,
  MapPin,
  Phone,
  Snowflake,
  Wifi,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useHostelBedDetailsViewModel } from '../hooks/useHostelBedDetailsViewModel'
import AppHeader from '../../shared/components/AppHeader'
import RequestVisitModal from '../components/RequestVisitModal'
import ChatModal from '../components/ChatModal'

const FeatureChip = ({ label, active, icon }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white">
      {icon}
    </div>
    <p className="text-xs font-semibold text-slate-700">{label}</p>
    <p className={`text-xs ${active ? 'text-emerald-700' : 'text-slate-500'}`}>
      {active ? 'Yes' : 'No'}
    </p>
  </div>
)

export default function HostelBedDetailsView() {
  const { hostelId: routeHostelId } = useParams()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const {
    details,
    loading,
    error,
    displayAddress,
    mapEmbedUrl,
    goBackToDashboard,
    requestMessage,
    setRequestMessage,
    submitRoomRequest,
    requesting,
    requestSuccess,
    actionError,
    trackingCall,
    logCallClick,
    canRequestRoom,
    isOwnerUser,
  } = useHostelBedDetailsViewModel()

  useEffect(() => {
    setActiveImageIndex(0)
  }, [details?.roomId, details?.bedNo, details?.hostelId])

  if (loading) {
    return (
      <main className="px-4 py-6">
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Loading bed details...
        </p>
      </main>
    )
  }

  if (error || !details) {
    return (
      <main className="px-4 py-6">
        <button
          type="button"
          onClick={goBackToDashboard}
          className="mb-4 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'No details found'}
        </p>
      </main>
    )
  }

  const images = details.images?.length ? details.images : ['/src/assets/hero.png']
  const image = images[activeImageIndex] || images[0]
  const chatHostelId = String(details.hostelId || routeHostelId || '').trim()
  const chatOwnerId = String(details.owner?.id || '').trim()
  const ownerPhone =
    `${details.owner?.profile?.phoneNumber || ''}`.trim() ||
    `${details.contact?.phone || ''}`.trim()
  const cleanPhone = ownerPhone.replace(/\D/g, '')
  const whatsappHref = cleanPhone ? `https://wa.me/${cleanPhone}` : '#'
  const onCallHost = async () => {
    if (!ownerPhone) return
    try {
      await logCallClick()
    } finally {
      window.location.href = `tel:${ownerPhone}`
    }
  }

  const onSubmitRequest = async () => {
    const success = await submitRoomRequest()
    if (success) {
      setRequestModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto px-4 py-6">
        {requestSuccess && (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {requestSuccess}
          </p>
        )}
        <button
          type="button"
          onClick={goBackToDashboard}
          className="mb-4 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <ArrowLeft size={14} />
          Back to beds
        </button>

      <h1 className="text-3xl font-bold text-slate-900">Hostel Unit Details</h1>
      <p className="mt-1 text-sm text-slate-500">
        Home &gt; Hostels &gt; {details.hostelName} &gt; Room {details.roomNo}
      </p>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={image}
                alt={details.hostelName}
                className="h-full min-h-[360px] w-full object-cover transition-all duration-500"
              />
              {images.length > 1 ? (
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
              ) : null}
            </div>
            {images.length > 1 ? (
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
                    <img
                      src={img}
                      alt={`${details.hostelName}-${index + 1}`}
                      className="h-16 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <iframe
              title={`Map for ${details.hostelName}`}
              src={mapEmbedUrl}
              className="h-[260px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-3xl font-semibold text-slate-900">
            {details.hostelName} - Unit {details.roomNo}
          </h2>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
            <MapPin size={14} />
            {displayAddress}
          </p>

          <div className="mt-4 rounded-xl bg-slate-100 p-3">
            <p className="text-3xl font-semibold text-teal-800">
              PKR {details.seatPrice.toLocaleString()} / month
              <span className="text-sm font-normal text-slate-600"> per bed</span>
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <p>
              <span className="text-slate-500">Room No:</span> {details.roomNo}
            </p>
            <p>
              <span className="text-slate-500">Floor:</span> {details.floorNumber}
            </p>
            <p>
              <span className="text-slate-500">Bed No:</span> {details.bedNo}
            </p>
            <p>
              <span className="text-slate-500">Status:</span>{' '}
              <span className={details.isAvailable ? 'text-emerald-700' : 'text-red-700'}>
                {details.isAvailable ? 'Available' : 'Occupied'}
              </span>
            </p>
            <p className="sm:col-span-2">
              <span className="text-slate-500">Sharing:</span>{' '}
              {details.sharingTypeLabel || `${details.sharingType}-sharing`}
            </p>
          </div>

          <h3 className="mt-6 text-xl font-semibold text-slate-900">Room Features</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <FeatureChip
              label="Attached Bath"
              active={details.roomFeatures.attachedBath}
              icon={<Bath size={16} />}
            />
            <FeatureChip
              label="Air Conditioning"
              active={details.roomFeatures.acAvailable}
              icon={<Snowflake size={16} />}
            />
            <FeatureChip
              label="Geyser"
              active={details.roomFeatures.geyserAvailable}
              icon={<Flame size={16} />}
            />
            <FeatureChip
              label="Wifi"
              active={details.roomFeatures.hasWifi}
              icon={<Wifi size={16} />}
            />
            <FeatureChip
              label="Balcony"
              active={details.roomFeatures.hasBalcony}
              icon={<BedSingle size={16} />}
            />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Contact Host</p>
            <p className="text-base font-semibold text-slate-900">
              {details.owner.profile.firstName} {details.owner.profile.lastName}
            </p>
            <p className="text-sm text-slate-600">{details.owner.email}</p>
            {ownerPhone && <p className="text-sm text-slate-600">{ownerPhone}</p>}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChatModalOpen(true)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50/60"
              >
                <MessageCircle size={15} />
                Chat
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                  cleanPhone
                    ? 'bg-emerald-600 text-white'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500'
                }`}
                onClick={(e) => {
                  if (!cleanPhone) e.preventDefault()
                }}
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={onCallHost}
                disabled={!ownerPhone || trackingCall}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Phone size={15} />
                {trackingCall ? 'Calling...' : 'Call Host'}
              </button>
              {!isOwnerUser && (
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  disabled={!canRequestRoom}
                  className="col-span-2 inline-flex items-center justify-center rounded-lg bg-teal-800 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Request Visit
                </button>
              )}
            </div>
          </div>
        </aside>
        </section>
      </main>
      <RequestVisitModal
        open={requestModalOpen}
        roomNo={details.roomNo}
        message={requestMessage}
        setMessage={setRequestMessage}
        loading={requesting}
        error={actionError}
        onClose={() => setRequestModalOpen(false)}
        onSubmit={onSubmitRequest}
      />
      <ChatModal
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        ownerName={`${details.owner.profile.firstName} ${details.owner.profile.lastName}`.trim()}
        hostelId={chatHostelId}
        ownerId={chatOwnerId}
      />
    </div>
  )
}
