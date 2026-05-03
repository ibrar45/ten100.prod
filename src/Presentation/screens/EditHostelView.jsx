import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, ImagePlus, Plus, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AddRoomModal from '../components/AddRoomModal'
import BedCard from '../components/BedCard'
import RoomCard from '../components/RoomCard'
import TabsLayout from '../components/TabsLayout'
import AppHeader from '../../shared/components/AppHeader'
import {
  fetchHostelBeds,
  fetchHostelDetails,
  patchHostelBed,
  updateHostel,
} from '../../features/hostels'
import { PRESET_HOSTEL_AMENITIES } from '../../shared/hostelListingPresets'

const AMENITY_OPTIONS = PRESET_HOSTEL_AMENITIES

const tabs = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'images', label: 'Images' },
]

/**
 * Prefer beds from GET /hostels/:id (room.beds), else rows from GET /hostels/rooms/beds,
 * else synthetic rows without bedId until API provides bed records.
 */
const mergeBedsStateForEditHostel = (details, globalBedRows, hostelId) => {
  const rooms = details?.rooms || []
  const byRoom = {}
  rooms.forEach((r) => {
    byRoom[r.id] = []
  })

  rooms.forEach((room) => {
    if (room.beds?.length) {
      byRoom[room.id] = room.beds.map((b) => ({
        id: b.id,
        bedNo: b.bedNo,
        status: b.status,
        listed: b.listed,
      }))
    }
  })

  const globalsForHostel = (globalBedRows || []).filter(
    (b) => String(b.hostelId) === String(hostelId),
  )

  rooms.forEach((room) => {
    if (byRoom[room.id]?.length) return
    const fromGlobal = globalsForHostel
      .filter((b) => b.roomId === room.id)
      .map((b) => ({
        id: b.bedId,
        bedNo: b.bedNo,
        status: b.status,
        listed: b.isListed,
      }))
      .sort((a, b) => a.bedNo - b.bedNo)
    if (fromGlobal.length) {
      byRoom[room.id] = fromGlobal
    }
  })

  rooms.forEach((room) => {
    if (byRoom[room.id]?.length) return
    const total = Number(room.totalSeats) || 0
    const avail = Number(room.availableSeats) || 0
    byRoom[room.id] = []
    for (let i = 1; i <= total; i += 1) {
      byRoom[room.id].push({
        id: '',
        bedNo: i,
        status: i <= avail ? 'available' : 'occupied',
        listed: true,
      })
    }
  })

  Object.keys(byRoom).forEach((rid) => {
    byRoom[rid].sort((a, b) => a.bedNo - b.bedNo)
  })

  return byRoom
}

export default function EditHostelView() {
  const navigate = useNavigate()
  const { hostelId } = useParams()
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [details, setDetails] = useState(null)

  const [basicForm, setBasicForm] = useState({
    name: '',
    contactPhone: '',
    contactEmail: '',
    city: '',
    area: '',
    street: '',
  })
  const [amenities, setAmenities] = useState([])
  const [images, setImages] = useState([])
  const [newImage, setNewImage] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [bedsState, setBedsState] = useState({})
  const [bedsDirty, setBedsDirty] = useState(false)
  const [addRoomOpen, setAddRoomOpen] = useState(false)

  const applyLoadedData = useCallback(
    (data, globalBeds) => {
      setDetails(data)
      setBasicForm({
        name: data?.name ?? '',
        contactPhone: data?.contact?.phone ?? '',
        contactEmail: data?.contact?.email ?? '',
        city: data?.address?.city ?? '',
        area: data?.address?.area ?? '',
        street: data?.address?.street ?? '',
      })
      setAmenities(Array.isArray(data?.amenities) ? data.amenities : [])
      setImages(Array.isArray(data?.images) ? data.images : [])
      setBedsState(mergeBedsStateForEditHostel(data, globalBeds, hostelId))
      setBedsDirty(false)
    },
    [hostelId],
  )

  const refreshAfterRoomCreate = useCallback(
    async (createdRoomNo) => {
      const [detailsResponse, bedsResponse] = await Promise.all([
        fetchHostelDetails(hostelId),
        fetchHostelBeds(),
      ])
      const data = detailsResponse?.data ?? null
      const globalBeds = Array.isArray(bedsResponse?.data) ? bedsResponse.data : []
      applyLoadedData(data, globalBeds)
      const rn = String(createdRoomNo ?? '').trim()
      const match = (data?.rooms || []).find((r) => String(r.roomNo).trim() === rn)
      setSelectedRoomId(match?.id ?? data?.rooms?.[0]?.id ?? '')
    },
    [applyLoadedData, hostelId],
  )

  useEffect(() => {
    if (!hostelId) return
    let ignore = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [detailsResponse, bedsResponse] = await Promise.all([
          fetchHostelDetails(hostelId),
          fetchHostelBeds(),
        ])
        if (ignore) return
        const data = detailsResponse?.data ?? null
        const globalBeds = Array.isArray(bedsResponse?.data) ? bedsResponse.data : []
        applyLoadedData(data, globalBeds)
        const firstRoomId = data?.rooms?.[0]?.id || ''
        setSelectedRoomId(firstRoomId)
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load hostel')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    void load()
    return () => {
      ignore = true
    }
  }, [applyLoadedData, hostelId])
  const onSaveBeds = async () => {
    if (!hostelId) return
    setSaving(true)
    setError('')
    try {
      const patches = []
      Object.values(bedsState).forEach((beds) => {
        ;(beds || []).forEach((bed) => {
          if (!bed.id) return
          patches.push(
            patchHostelBed(bed.id, {
              status: bed.status,
              isListed: bed.listed,
            }),
          )
        })
      })
      if (patches.length === 0) {
        setToast('No beds with API IDs to update. Open GET /hostels/rooms/beds or ensure rooms include beds.')
        setBedsDirty(false)
        return
      }
      await Promise.all(patches)
      setBedsDirty(false)
      setToast('Bed changes saved')
    } catch (e) {
      setError(e?.message || 'Failed to save bed changes')
    } finally {
      setSaving(false)
    }
  }

  const updateBed = (roomId, bedNo, updater) => {
    setBedsDirty(true)
    setBedsState((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map((item) =>
        item.bedNo === bedNo ? updater(item) : item,
      ),
    }))
  }


  const rooms = details?.rooms || []
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) || null,
    [rooms, selectedRoomId],
  )

  const onSaveBasic = async () => {
    if (!hostelId) return
    setSaving(true)
    setError('')
    try {
      await updateHostel(hostelId, {
        name: basicForm.name.trim(),
        contact: {
          phone: basicForm.contactPhone.trim(),
          email: basicForm.contactEmail.trim(),
        },
        address: {
          city: basicForm.city.trim(),
          area: basicForm.area.trim(),
          street: basicForm.street.trim(),
        },
      })
      setToast('Basic info saved')
    } catch (e) {
      setError(e?.message || 'Failed to save basic info')
    } finally {
      setSaving(false)
    }
  }

  const onSaveAmenities = async () => {
    if (!hostelId) return
    setSaving(true)
    setError('')
    try {
      await updateHostel(hostelId, { amenities })
      setToast('Amenities saved')
    } catch (e) {
      setError(e?.message || 'Failed to save amenities')
    } finally {
      setSaving(false)
    }
  }

  const onSaveImages = async () => {
    if (!hostelId) return
    setSaving(true)
    setError('')
    try {
      await updateHostel(hostelId, { images })
      setToast('Images saved')
    } catch (e) {
      setError(e?.message || 'Failed to save images')
    } finally {
      setSaving(false)
    }
  }

  const toggleAmenity = (item) =>
    setAmenities((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]))

  const addImage = () => {
    const url = newImage.trim()
    if (!url) return
    setImages((prev) => [...prev, url])
    setNewImage('')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-52 w-full overflow-hidden bg-slate-800">
            {details?.images?.[0] ? (
              <img src={details.images[0]} alt={details.name} className="h-full w-full object-cover opacity-85" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h1 className="text-2xl font-semibold text-white">{details?.name || 'Edit Listing'}</h1>
              <p className="mt-1 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
                {(details?.listingStatus || 'draft').toUpperCase()}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <TabsLayout tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {error ? (
              <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
            {toast ? (
              <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{toast}</p>
            ) : null}

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shimmer h-14 rounded-xl" />
                ))}
              </div>
            ) : null}

            {!loading && activeTab === 'basic' ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-slate-800">Hostel Name</span>
                    <input
                      value={basicForm.name}
                      onChange={(e) => setBasicForm((p) => ({ ...p, name: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-slate-800">Primary Phone Number</span>
                    <input
                      value={basicForm.contactPhone}
                      onChange={(e) => setBasicForm((p) => ({ ...p, contactPhone: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-slate-800">Contact Email</span>
                    <input
                      value={basicForm.contactEmail}
                      onChange={(e) => setBasicForm((p) => ({ ...p, contactEmail: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-slate-800">City</span>
                    <input
                      value={basicForm.city}
                      onChange={(e) => setBasicForm((p) => ({ ...p, city: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-slate-800">Area</span>
                    <input
                      value={basicForm.area}
                      onChange={(e) => setBasicForm((p) => ({ ...p, area: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-slate-800">Street</span>
                    <input
                      value={basicForm.street}
                      onChange={(e) => setBasicForm((p) => ({ ...p, street: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2"
                    />
                  </label>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={onSaveBasic}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save Basic Info'}
                  </button>
                </div>
              </section>
            ) : null}

            {!loading && activeTab === 'rooms' ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Rooms</h3>
                  <button
                    type="button"
                    onClick={() => setAddRoomOpen(true)}
                    disabled={!hostelId}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={16} aria-hidden />
                    Add Room
                  </button>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <div className="space-y-3">
                  {rooms.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      No rooms added yet
                    </p>
                  ) : (
                    rooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={{
                          ...room,
                          availableSeats: (bedsState[room.id] || []).filter((bed) => bed.status === 'available').length || room.availableSeats,
                        }}
                        active={room.id === selectedRoomId}
                        onSelect={() => setSelectedRoomId(room.id)}
                        onEdit={() => {
                          setSelectedRoomId(room.id)
                          setToast(`Room ${room.roomNo} selected. Bed controls are shown on the right.`)
                        }}
                      />
                    ))
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 size={16} className="text-slate-700" />
                    <h3 className="text-sm font-semibold text-slate-900">Beds in this room</h3>
                  </div>
                  {!selectedRoom ? (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      Beds will appear here
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(bedsState[selectedRoom.id] || []).map((bed) => (
                        <BedCard
                          key={bed.id || `${selectedRoom.id}-${bed.bedNo}`}
                          bed={bed}
                          canPersist={Boolean(bed.id)}
                          onToggleListed={() =>
                            updateBed(selectedRoom.id, bed.bedNo, (item) => ({
                              ...item,
                              listed: !item.listed,
                            }))
                          }
                          onStatusChange={(status) =>
                            updateBed(selectedRoom.id, bed.bedNo, (item) => ({
                              ...item,
                              status,
                            }))
                          }
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={onSaveBeds}
                      disabled={!bedsDirty || saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saving ? 'Saving...' : 'Save Bed Changes'}
                    </button>
                  </div>
                </div>
                </div>
                <AddRoomModal
                  open={addRoomOpen}
                  onClose={() => setAddRoomOpen(false)}
                  hostelId={hostelId}
                  isShortStayAvailable={Boolean(details?.isShortStayAvailable)}
                  onCreated={async (roomNo) => {
                    setAddRoomOpen(false)
                    setError('')
                    try {
                      await refreshAfterRoomCreate(roomNo)
                      setToast('Room added successfully')
                    } catch (e) {
                      setError(e?.message || 'Room may have been created, but refreshing the listing failed.')
                    }
                  }}
                />
              </section>
            ) : null}

            {!loading && activeTab === 'amenities' ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {AMENITY_OPTIONS.map((item) => (
                    <label key={item} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={amenities.includes(item)}
                        onChange={() => toggleAmenity(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={onSaveAmenities}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save Amenities'}
                  </button>
                </div>
              </section>
            ) : null}

            {!loading && activeTab === 'images' ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <ImagePlus size={16} className="text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Images</p>
                </div>
                <div className="mb-3 flex gap-2">
                  <input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Paste image URL"
                    className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>
                {images.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No images uploaded yet
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((src, index) => (
                      <div key={`${src}-${index}`} className="overflow-hidden rounded-xl border border-slate-200">
                        <img src={src} alt="Hostel" className="h-32 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                          className="w-full border-t border-slate-200 bg-white py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={onSaveImages}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
                  >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save Images'}
                  </button>
                </div>
              </section>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/owner/listings')}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Back to My Listings
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
