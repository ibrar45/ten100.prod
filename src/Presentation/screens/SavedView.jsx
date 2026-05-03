import { MapPin, BedSingle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../shared/components/AppHeader'
import SaveButton from '../components/SaveButton'
import Card from '../../shared/components/Card'
import EmptyState from '../../shared/components/EmptyState'
import { useSavedItems } from '../../shared/hooks/useSavedItems'
import { resolveImageUrl } from '../../shared/utils/resolveImageUrl'

export default function SavedView() {
  const navigate = useNavigate()
  const { savedHostels, savedBeds, removeSavedHostel, removeSavedBed } = useSavedItems()
  const hasAny = savedHostels.length > 0 || savedBeds.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <AppHeader />
      <main className="mx-auto max-w-screen-lg px-4 py-12 sm:px-6">
        <h1 className="mb-5 text-2xl font-semibold text-slate-900">Saved</h1>

        {!hasAny ? (
          <EmptyState
            title="No Saved Items Yet"
            description="Tap the heart icon on hostel or bed cards to save them here."
          />
        ) : null}

        {savedHostels.length > 0 ? (
          <Card className="mb-6 p-4">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Saved Hostels</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedHostels.map((hostel) => (
                <button
                  type="button"
                  key={hostel.id}
                  onClick={() => navigate(`/hostel/${hostel.id}`)}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <SaveButton
                    isSaved
                    pending={false}
                    onToggle={(event) => {
                      event.stopPropagation()
                      removeSavedHostel(hostel.id)
                    }}
                    className="absolute right-2 top-2 z-10"
                  />
                  <img
                    src={resolveImageUrl(hostel.image)}
                    alt={hostel.name}
                    className="h-32 w-full object-cover"
                  />
                  <div className="space-y-1 p-3">
                    <h3 className="text-sm font-semibold text-slate-900">{hostel.name}</h3>
                    <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <MapPin size={12} />
                      {hostel.area}, {hostel.city}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      PKR {(hostel.minRent || 0).toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ) : null}

        {savedBeds.length > 0 ? (
          <Card className="p-4">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Saved Beds</h2>
            <div className="grid gap-3">
              {savedBeds.map((bed) => (
                <button
                  type="button"
                  key={bed.key}
                  onClick={() => navigate(`/beds/${bed.hostelId}/${bed.roomId}/${bed.bedNo}`)}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <SaveButton
                    isSaved
                    pending={false}
                    onToggle={(event) => {
                      event.stopPropagation()
                      removeSavedBed(bed.key)
                    }}
                    className="absolute right-2 top-2 z-10"
                  />
                  <div className="flex">
                    <img
                      src={resolveImageUrl(bed.image)}
                      alt={bed.hostelName || 'Saved bed'}
                      className="h-28 w-28 object-cover"
                    />
                    <div className="space-y-1 p-3">
                      <h3 className="text-sm font-semibold text-slate-900">{bed.hostelName}</h3>
                      <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <BedSingle size={12} />
                        Room {bed.roomNo} • Bed #{bed.bedNo}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        PKR {(bed.seatPrice || 0).toLocaleString()}
                        <span className="text-xs font-normal text-slate-500"> / month</span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ) : null}
      </main>
    </div>
  )
}
