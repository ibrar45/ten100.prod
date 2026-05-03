import {
  BedSingle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Headphones,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useDashboardViewModel } from '../hooks/useDashboardViewModel'
import AppHeader from '../../shared/components/AppHeader'
import DashboardFiltersDrawer from '../components/DashboardFiltersDrawer'
import SaveButton from '../components/SaveButton'
import { useLocalSavedItems } from '../hooks/saved/useLocalSavedItems'
import { resolveImageUrl } from '../../shared/utils/resolveImageUrl'

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200">
    <div className="shimmer h-40" />
    <div className="space-y-2 p-4">
      <div className="shimmer h-4 w-2/3 rounded" />
      <div className="shimmer h-3 w-1/2 rounded" />
      <div className="shimmer h-6 w-1/3 rounded" />
    </div>
  </div>
)

const categoryPills = [
  'All',
  'Top Rated',
  'Budget Friendly',
  'Girls Hostel',
  'Boys Hostel',
  'Dorm Beds',
  'Private Rooms',
]

export default function DashboardView() {
  const {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    setPriceOpen,
    setAreaOpen,
    setPolicyOpen,
    priceMinDraft,
    setPriceMinDraft,
    priceMaxDraft,
    setPriceMaxDraft,
    visibleHostelCount,
    setVisibleHostelCount,
    showAllFeatured,
    loading,
    error,
    locationLabel,
    areaOptions,
    policyOptions,
    filteredHostels,
    pagedFeaturedHostels,
    filteredAvailableBeds,
    availableBedsByHostelId,
    minRentByHostelId,
    hostels,
    hasActiveFilters,
    canSlideFeatured,
    clearFilters,
    cycleMinBeds,
    handleFeaturedPrev,
    handleFeaturedNext,
    toggleSeeAllFeatured,
    goToHostel,
    goToBed,
    stayCheckIn,
    setStayCheckIn,
    stayCheckOut,
    setStayCheckOut,
    stayRangeApplied,
    applyHeroSearch,
  } = useDashboardViewModel()

  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false)
  const { isHostelSaved, isBedSaved, toggleSavedHostel, toggleSavedBed } = useLocalSavedItems()

  const recentlyViewed = filteredHostels.slice(0, 4)

  return (
    <div className="min-h-screen bg-[#f7f7f9] text-slate-900">
      <AppHeader />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-5 lg:px-6">
        <DashboardFiltersDrawer
          open={filtersDrawerOpen}
          onClose={() => setFiltersDrawerOpen(false)}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Refine listings
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-rose-500 hover:text-rose-600"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </p>
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, search: event.target.value }))
                    }
                    placeholder="Search by city or area"
                    className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Guests
                </p>
                <button
                  type="button"
                  onClick={cycleMinBeds}
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-sm"
                >
                  {filters.minBeds == null ? '1 Guest' : `${filters.minBeds}+ Guests`}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Budget per month
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMinDraft}
                    onChange={(event) => setPriceMinDraft(event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMaxDraft}
                    onChange={(event) => setPriceMaxDraft(event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: priceMinDraft ? Number(priceMinDraft) : null,
                      maxPrice: priceMaxDraft ? Number(priceMaxDraft) : null,
                    }))
                  }
                  className="mt-2 h-9 w-full rounded-lg bg-teal-800 text-sm font-semibold text-white"
                >
                  Apply budget
                </button>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Area
                </p>
                <select
                  value={filters.area || ''}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      area: event.target.value || null,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="">Any area</option>
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hostel type
                </p>
                <select
                  value={filters.genderPolicy || ''}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      genderPolicy: event.target.value || null,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="">Any policy</option>
                  {policyOptions.map((policy) => (
                    <option key={policy} value={policy}>
                      {policy}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFiltersDrawerOpen(false)}
              className="mt-5 h-11 w-full rounded-xl bg-rose-500 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Show {filteredHostels.length} results
            </button>
        </DashboardFiltersDrawer>

          <section className="space-y-5">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFiltersDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <SlidersHorizontal size={18} className="text-rose-500" aria-hidden />
                Filters
              </button>
            </div>
            <article
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(10,15,25,0.38), rgba(10,15,25,0.55)), url('/src/assets/dashboard.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="px-6 pb-5 pt-8 text-white sm:px-8">
                <h1 className="mt-2 max-w-lg text-4xl font-bold leading-tight">
                  Find a place you&apos;ll love to call home.
                </h1>
                <p className="mt-1 text-sm text-slate-200">
                  Safe. Affordable. Comfortable in {locationLabel}.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-2 rounded-2xl bg-white/95 p-2 text-slate-700 shadow-lg md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                  <div className="rounded-xl px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Where</p>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, search: event.target.value }))
                      }
                      placeholder="Search by city or area"
                      className="mt-1 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                  <div className="rounded-xl px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Check-in</p>
                    <label className="mt-1 flex cursor-pointer items-center gap-1 text-sm text-slate-800">
                      <CalendarDays size={13} className="shrink-0 text-slate-500" aria-hidden />
                      <input
                        type="date"
                        value={stayCheckIn}
                        onChange={(e) => setStayCheckIn(e.target.value)}
                        className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm outline-none [color-scheme:light]"
                      />
                    </label>
                  </div>
                  <div className="rounded-xl px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Check-out</p>
                    <label className="mt-1 flex cursor-pointer items-center gap-1 text-sm text-slate-800">
                      <CalendarDays size={13} className="shrink-0 text-slate-500" aria-hidden />
                      <input
                        type="date"
                        value={stayCheckOut}
                        min={stayCheckIn || undefined}
                        onChange={(e) => setStayCheckOut(e.target.value)}
                        className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm outline-none [color-scheme:light]"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={cycleMinBeds}
                    className="rounded-xl px-3 py-2 text-left"
                  >
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Guests</p>
                    <p className="mt-1 text-sm">
                      {filters.minBeds == null ? '1 Guest' : `${filters.minBeds}+ Guests`}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={applyHeroSearch}
                    className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                  >
                    Search
                  </button>
                </div>
                {stayRangeApplied ? (
                  <p className="mt-3 text-center text-xs font-medium text-teal-100">
                    Showing short-stay hostels only for your selected dates.
                  </p>
                ) : null}
              </div>
            </article>

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {categoryPills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        category: pill,
                      }))
                    }
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      filters.category === pill
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </section>

            <section
              className={`overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${
                showFilters ? 'max-h-96 opacity-100' : 'max-h-0 border-transparent p-0 opacity-0'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <FilterX size={14} />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPriceOpen((open) => !open)
                    setAreaOpen(false)
                    setPolicyOpen(false)
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                >
                  <SlidersHorizontal size={14} />
                  Price
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAreaOpen((open) => !open)
                    setPriceOpen(false)
                    setPolicyOpen(false)
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                >
                  Area
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPolicyOpen((open) => !open)
                    setPriceOpen(false)
                    setAreaOpen(false)
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                >
                  Unit type
                </button>
                <button
                  type="button"
                  onClick={cycleMinBeds}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                >
                  <Users size={14} />
                  Beds
                </button>
              </div>
            </section>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Top Hostels For You</h2>
                  <p className="text-sm text-slate-500">
                    Handpicked stays based on your preferences
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSeeAllFeatured}
                  className="text-sm font-medium text-rose-500"
                >
                  {showAllFeatured ? 'Show less' : 'View all'}
                </button>
              </div>

              <div className="relative">
                {!showAllFeatured && (
                  <>
                    <button
                      type="button"
                      onClick={handleFeaturedPrev}
                      disabled={!canSlideFeatured}
                      className="absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow sm:flex"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleFeaturedNext}
                      disabled={!canSlideFeatured}
                      className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow sm:flex"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {loading &&
                    Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={`top-sk-${i}`} />)}
                  {pagedFeaturedHostels.map((hostel) => {
                    const minRent = minRentByHostelId.get(hostel.id) || 0
                    const bedCount = availableBedsByHostelId.get(hostel.id) || 0
                    return (
                      <button
                        type="button"
                        key={hostel.id}
                        onClick={() => goToHostel(hostel.id)}
                        className="group hover-lift relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-shadow duration-200 hover:border-slate-300 hover:shadow-md"
                      >
                        <SaveButton
                          isSaved={isHostelSaved(hostel.id)}
                          pending={false}
                          onToggle={(event) => {
                            event.stopPropagation()
                            toggleSavedHostel({
                              id: hostel.id,
                              name: hostel.name,
                              image: resolveImageUrl(hostel.images?.[0]),
                              area: hostel.address?.area || '',
                              city: hostel.address?.city || '',
                              minRent,
                            })
                          }}
                          className="absolute right-2 top-2 z-10"
                        />
                        <img
                          src={resolveImageUrl(hostel.images?.[0])}
                          alt={hostel.name}
                          className="h-36 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="space-y-1 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold">{hostel.name}</h3>
                            <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                              <Star size={12} />
                              {hostel.ratingAverage?.toFixed?.(1) ?? '0.0'}
                            </p>
                          </div>
                          {hostel.isShortStayAvailable && (
                            <p className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Short Stay Available
                            </p>
                          )}
                          <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={12} />
                            {hostel.address?.area}, {hostel.address?.city}
                          </p>
                          <p className="text-base font-semibold text-slate-900">
                            PKR {minRent.toLocaleString()}
                            <span className="text-xs font-normal text-slate-500"> / month</span>
                          </p>
                          <p className="inline-flex items-center gap-1 text-xs text-slate-600">
                            <BedSingle size={12} />
                            {bedCount} beds • {hostel.availableRoomCount || 0} rooms
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Recently Viewed</h2>
                <button type="button" className="text-sm font-medium text-rose-500">
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={`recent-sk-${i}`} />)}
                {!loading &&
                  recentlyViewed.map((hostel) => (
                    <button
                      type="button"
                      key={`recent-${hostel.id}`}
                      onClick={() => goToHostel(hostel.id)}
                      className="group hover-lift relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-shadow duration-200 hover:border-slate-300 hover:shadow-md"
                    >
                      <SaveButton
                        isSaved={isHostelSaved(hostel.id)}
                        pending={false}
                        onToggle={(event) => {
                          event.stopPropagation()
                          toggleSavedHostel({
                            id: hostel.id,
                            name: hostel.name,
                            image: resolveImageUrl(hostel.images?.[0]),
                            area: hostel.address?.area || '',
                            city: hostel.address?.city || '',
                            minRent: minRentByHostelId.get(hostel.id) || 0,
                          })
                        }}
                        className="absolute right-2 top-2 z-10"
                      />
                      <img
                        src={resolveImageUrl(hostel.images?.[0])}
                        alt={hostel.name}
                        className="h-32 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      />
                      <div className="p-3">
                        <h3 className="truncate text-sm font-semibold">{hostel.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {hostel.address?.area}, {hostel.address?.city}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </section>

            <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
              <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck size={16} className="text-rose-500" />
                Verified Properties
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <SlidersHorizontal size={16} className="text-rose-500" />
                Secure Payments
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Headphones size={16} className="text-rose-500" />
                24/7 Support
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Users size={16} className="text-rose-500" />
                Flexible Stays
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-amber-50 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-2xl font-semibold text-slate-900">Refer a friend & Earn</h3>
              <p className="mt-1 text-sm text-slate-600">
                When they book their first stay with us.
              </p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-600 hover:shadow-md active:scale-[0.98]"
              >
                Refer now
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Beds Available Right Now</h2>
                <p className="text-sm text-slate-500">
                  Showing {Math.min(visibleHostelCount, filteredAvailableBeds.length)} of{' '}
                  {filteredAvailableBeds.length}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredAvailableBeds.slice(0, visibleHostelCount).map((bed) => {
                  const hostel = hostels.find((item) => item.id === bed.hostelId)
                  return (
                    <button
                      type="button"
                      key={`${bed.roomId}-${bed.bedNo}`}
                      onClick={() => goToBed(bed)}
                      className="hover-lift relative overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-shadow duration-200 hover:border-slate-300"
                    >
                      <SaveButton
                        isSaved={isBedSaved(bed)}
                        pending={false}
                        onToggle={(event) => {
                          event.stopPropagation()
                          toggleSavedBed({
                            hostelId: bed.hostelId,
                            roomId: bed.roomId,
                            bedNo: bed.bedNo,
                            roomNo: bed.roomNo,
                            hostelName: hostel?.name || bed.hostelName,
                            image: resolveImageUrl(hostel?.images?.[0]),
                            seatPrice: bed.seatPrice,
                          })
                        }}
                        className="absolute right-2 top-2 z-10"
                      />
                      <div className="flex">
                        <img
                          src={resolveImageUrl(hostel?.images?.[0])}
                          alt={hostel?.name || 'Hostel bed'}
                          className="h-28 w-28 object-cover"
                        />
                        <div className="p-3">
                          <h3 className="text-sm font-semibold">
                            {hostel?.name || bed.hostelName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Room {bed.roomNo} • Bed #{bed.bedNo}
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-900">
                            PKR {bed.seatPrice.toLocaleString()}
                            <span className="text-xs font-normal text-slate-500"> / month</span>
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {visibleHostelCount < filteredAvailableBeds.length && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleHostelCount((prev) =>
                      Math.min(prev + 4, filteredAvailableBeds.length),
                    )
                  }
                  className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
                >
                  Load more
                </button>
              )}
            </section>
          </section>
      </main>
    </div>
  )
}
