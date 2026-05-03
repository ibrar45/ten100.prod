import { useMemo, useState } from 'react'
import { Inbox, LayoutGrid } from 'lucide-react'
import AppHeader from '../../shared/components/AppHeader'
import EmptyState from '../components/EmptyState'
import HeroCreateCard from '../components/HeroCreateCard'
import HostelCard from '../components/HostelCard'
import ListingFilterBar from '../components/ListingFilterBar'
import RequestsPanel from '../components/RequestsPanel'
import SkeletonCard from '../components/SkeletonCard'
import { useOwnerListingsViewModel } from '../hooks/useOwnerListingsViewModel'
import { useOwnerRequestsInboxViewModel } from '../hooks/useOwnerRequestsInboxViewModel'

export default function MyListingsView() {
  const [activeSection, setActiveSection] = useState('listings')
  const [activeFilter, setActiveFilter] = useState('all')
  const {
    myListings,
    loading,
    error,
    listingAction,
    goToHostel,
    goToEditHostel,
    goToCreateHostel,
    retryLoadListings,
    onPublishListing,
    onDeleteListing,
  } = useOwnerListingsViewModel()
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    toastMessage,
    respondingRequestId,
    retryLoadRequests,
    clearToast,
    respondToRequest,
  } = useOwnerRequestsInboxViewModel()

  const filteredListings = useMemo(() => {
    if (activeFilter === 'all') return myListings
    return myListings.filter((listing) => {
      const status = (listing.listingStatus || '').toLowerCase()
      if (activeFilter === 'published') return status === 'published'
      return status !== 'published'
    })
  }, [activeFilter, myListings])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-screen-2xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className={loading ? 'animate-pulse' : 'animate-[appRouteEnter_0.32s_ease-out_both]'}>
          {loading ? (
            <div className="h-56 rounded-2xl border border-slate-200/70 bg-slate-200/60 shadow-lg" />
          ) : (
            <HeroCreateCard
              onAddProperty={goToCreateHostel}
              onLearnMore={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Inbox
            </p>
            <button
              type="button"
              onClick={() => setActiveSection('listings')}
              className={`mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                activeSection === 'listings'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid size={15} />
              My Listings
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('requests')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                activeSection === 'requests'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Inbox size={15} />
              Requests
            </button>
          </aside>

          {activeSection === 'listings' ? (
            <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-lg backdrop-blur sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">My Listings</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage your draft and published hostels.
                  </p>
                </div>
                <ListingFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              </div>

              {error && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <p>{error || 'Failed to load listings'}</p>
                  <button
                    type="button"
                    onClick={retryLoadListings}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 transition-all md:grid-cols-2 xl:grid-cols-3">
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`owner-sk-${i}`} />)}

                {!loading && filteredListings.length === 0 && (
                  <EmptyState onCreate={goToCreateHostel} />
                )}

                {filteredListings.map((listing) => {
                  const isPublishing =
                    listingAction.id === listing.id && listingAction.type === 'publish'
                  const isDeleting = listingAction.id === listing.id && listingAction.type === 'delete'

                  return (
                    <div
                      key={listing.id}
                      className={loading ? '' : 'animate-[appRouteEnter_0.32s_ease-out_both]'}
                    >
                      <HostelCard
                        listing={listing}
                        isPublishing={isPublishing}
                        isDeleting={isDeleting}
                        onView={() => goToHostel(listing.id)}
                        onEdit={() => goToEditHostel(listing.id)}
                        onPublish={() => onPublishListing(listing.id)}
                        onDelete={() => onDeleteListing(listing.id)}
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          ) : (
            <RequestsPanel
              requests={requests}
              loading={requestsLoading}
              error={requestsError}
              toastMessage={toastMessage}
              respondingRequestId={respondingRequestId}
              onRetry={retryLoadRequests}
              onRespond={respondToRequest}
              onClearToast={clearToast}
            />
          )}
        </div>
      </main>
    </div>
  )
}
