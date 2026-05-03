import { useMemo, useState } from 'react'
import {
  BarChart3,
  Building2,
  Inbox,
  LayoutGrid,
  MessageSquareText,
  PhoneCall,
  Radar,
  Users,
} from 'lucide-react'
import AppHeader from '../../shared/components/AppHeader'
import CircularProgressCard from '../components/CircularProgressCard'
import DonutChartCard from '../components/DonutChartCard'
import EmptyState from '../components/EmptyState'
import EmptyStateCard from '../components/EmptyStateCard'
import HeroCreateCard from '../components/HeroCreateCard'
import HostelCard from '../components/HostelCard'
import ListingFilterBar from '../components/ListingFilterBar'
import OwnerStatsCard from '../components/OwnerStatsCard'
import RequestsPanel from '../components/RequestsPanel'
import MessagePage from '../components/MessagePage'
import SkeletonCard from '../components/SkeletonCard'
import { useOwnerDashboardViewModel } from '../hooks/useOwnerDashboardViewModel'
import { useOwnerListingsViewModel } from '../hooks/useOwnerListingsViewModel'
import { useOwnerRequestsInboxViewModel } from '../hooks/useOwnerRequestsInboxViewModel'

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="shimmer h-3 w-1/3 rounded" />
    <div className="mt-3 shimmer h-7 w-1/2 rounded" />
    <div className="mt-2 shimmer h-3 w-2/3 rounded" />
  </div>
)

export default function OwnerDashboardView() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [activeFilter, setActiveFilter] = useState('all')

  const { loading, error, topStats, requestSummary, growth, recentActivity } =
    useOwnerDashboardViewModel()
  const {
    myListings,
    loading: listingsLoading,
    error: listingsError,
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
      return activeFilter === 'published' ? status === 'published' : status !== 'published'
    })
  }, [activeFilter, myListings])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Building2 size={18} />
              </div>
              <p className="text-3xl font-extrabold text-slate-700">AK</p>
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Menu</p>
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  activeTab === 'analytics'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 size={15} />
                Analytics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  activeTab === 'listings' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid size={15} />
                My Listings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  activeTab === 'requests' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Inbox size={15} />
                Requests
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('messages')}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  activeTab === 'messages' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquareText size={15} />
                Messages
              </button>
            </nav>
          </aside>

          <section>
            {activeTab === 'analytics' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Owner Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Overview of your hostel performance
                  </p>
                </div>

                {error && (
                  <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <StatCardSkeleton key={`sk-${index}`} />
                    ))
                  ) : (
                    <>
                      <OwnerStatsCard
                        label="Total Listings"
                        value={topStats.totalListings}
                        hint="All listings"
                        icon={<LayoutGrid size={18} />}
                      />
                      <OwnerStatsCard
                        label="Published Hostels"
                        value={topStats.publishedHostels}
                        hint="Live on marketplace"
                        tone="blue"
                        icon={<Building2 size={18} />}
                      />
                      <OwnerStatsCard
                        label="Total Requests"
                        value={topStats.totalRequests}
                        hint="Room visit requests"
                        tone="amber"
                        icon={<Users size={18} />}
                      />
                      <OwnerStatsCard
                        label="Total Calls"
                        value={topStats.totalCalls}
                        hint="Call clicks"
                        tone="rose"
                        icon={<PhoneCall size={18} />}
                      />
                      <OwnerStatsCard
                        label="Chat Messages"
                        value={topStats.chatMessages}
                        hint="Incoming chat activity"
                        tone="teal"
                        icon={<MessageSquareText size={18} />}
                      />
                    </>
                  )}
                </section>

                <section className="mb-8 grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm transition-all">
                <h2 className="text-lg font-semibold text-slate-900">Request Activity</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                  <DonutChartCard
                    title="Pending vs Responded"
                    total={requestSummary.total}
                    pending={requestSummary.pending}
                    responded={requestSummary.responded}
                    loading={loading}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="shimmer h-3 w-2/3 rounded" />
                            <div className="mt-2 shimmer h-6 w-1/2 rounded" />
                          </div>
                        ))
                      : (
                          <>
                            <div className="hover-lift rounded-xl border border-slate-200 bg-white p-3 transition-all">
                              <p className="text-xs text-slate-500">Total Requests</p>
                              <p className="text-2xl font-semibold">{requestSummary.total}</p>
                            </div>
                            <div className="hover-lift rounded-xl border border-amber-200 bg-amber-50 p-3 transition-all">
                              <p className="text-xs text-amber-700">Pending Requests</p>
                              <p className="text-2xl font-semibold text-amber-800">
                                {requestSummary.pending}
                              </p>
                            </div>
                            <div className="hover-lift rounded-xl border border-emerald-200 bg-emerald-50 p-3 transition-all">
                              <p className="text-xs text-emerald-700">Responded Requests</p>
                              <p className="text-2xl font-semibold text-emerald-800">
                                {requestSummary.responded}
                              </p>
                            </div>
                            <div className="hover-lift rounded-xl border border-slate-200 bg-white p-3 transition-all">
                              <p className="text-xs text-slate-500">Today Requests</p>
                              <p className="text-2xl font-semibold">{requestSummary.today}</p>
                            </div>
                          </>
                        )}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm transition-all">
                <h2 className="text-lg font-semibold text-slate-900">Weekly Growth</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <CircularProgressCard
                    label="Views"
                    thisWeek={growth.viewsThisWeek}
                    lastWeek={growth.viewsLastWeek}
                    loading={loading}
                  />
                  <CircularProgressCard
                    label="Requests"
                    thisWeek={growth.requestsThisWeek}
                    lastWeek={growth.requestsLastWeek}
                    loading={loading}
                  />
                  <CircularProgressCard
                    label="Calls"
                    thisWeek={growth.callsThisWeek}
                    lastWeek={growth.callsLastWeek}
                    loading={loading}
                  />
                </div>
              </article>
                </section>

                <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-800">
                <Radar size={20} className="text-teal-700" />
                <h2 className="text-base font-semibold">Recent Activity</h2>
              </div>
              {loading ? (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-3">
                      <div className="shimmer h-3 w-1/3 rounded" />
                      <div className="mt-2 shimmer h-3 w-2/3 rounded" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No recent activity yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {recentActivity.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="text-sm">
                        <span className="font-semibold text-slate-800">{item.type}:</span>{' '}
                        <span className="text-slate-700">{item.label}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.time ? new Date(item.time).toLocaleString() : '—'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
                </section>
              </>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-5">
                <HeroCreateCard
                  onAddProperty={goToCreateHostel}
                  onLearnMore={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
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
                      {listingsError && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          <p>{listingsError || 'Failed to load listings'}</p>
                          <button
                            type="button"
                            onClick={retryLoadListings}
                            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {listingsLoading &&
                          Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={`owner-sk-${i}`} />
                          ))}
                        {!listingsLoading && filteredListings.length === 0 && (
                          <EmptyState onCreate={goToCreateHostel} />
                        )}
                        {filteredListings.map((listing) => {
                          const isPublishing =
                            listingAction.id === listing.id && listingAction.type === 'publish'
                          const isDeleting =
                            listingAction.id === listing.id && listingAction.type === 'delete'
                          return (
                            <HostelCard
                              key={listing.id}
                              listing={listing}
                              isPublishing={isPublishing}
                              isDeleting={isDeleting}
                              onView={() => goToHostel(listing.id)}
                              onEdit={() => goToEditHostel(listing.id)}
                              onPublish={() => onPublishListing(listing.id)}
                              onDelete={() => onDeleteListing(listing.id)}
                            />
                          )
                        })}
                      </div>
                </section>
              </div>
            )}

            {activeTab === 'requests' && (
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

            {activeTab === 'messages' && (
              <div className="animate-[appRouteEnter_0.32s_ease-out_both]">
                <div className="mb-6">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Messages</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Reply to tenants · inbox preview (UI only)
                  </p>
                </div>
                <MessagePage />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
