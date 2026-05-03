import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import PageLoadingFallback from './Presentation/components/PageLoadingFallback'
import RequireAuth from './Presentation/components/RequireAuth'
import RequireOwner from './Presentation/components/RequireOwner'

const HostelsBrowseView = lazy(() => import('./Presentation/screens/HostelsBrowseView.jsx'))
const DashboardRedirectView = lazy(() => import('./Presentation/screens/DashboardRedirectView.jsx'))
const HostelDetailsView = lazy(() => import('./Presentation/screens/HostelDetailsView.jsx'))
const HostelBedDetailsView = lazy(() => import('./Presentation/screens/HostelBedDetailsView.jsx'))
const LoginView = lazy(() => import('./Presentation/screens/LoginView.jsx'))
const MyAccountView = lazy(() => import('./Presentation/screens/MyAccountView.jsx'))
const MyListingsView = lazy(() => import('./Presentation/screens/MyListingsView.jsx'))
const CreateHostelView = lazy(() => import('./Presentation/screens/CreateHostelView.jsx'))
const CreatePropertyGateView = lazy(() => import('./Presentation/screens/CreatePropertyGateView.jsx'))
const CreateRoomView = lazy(() => import('./Presentation/screens/CreateRoomView.jsx'))
const OwnerDashboardView = lazy(() => import('./Presentation/screens/OwnerDashboardView.jsx'))
const EditHostelView = lazy(() => import('./Presentation/screens/EditHostelView.jsx'))
const SavedView = lazy(() => import('./Presentation/screens/SavedView.jsx'))
const RequestsView = lazy(() => import('./Presentation/screens/RequestsView.jsx'))

function AppRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="app-route-enter min-h-screen">
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/hostels" replace />} />
          <Route path="/hostels" element={<HostelsBrowseView />} />
          <Route path="/hostel/:id" element={<HostelDetailsView />} />
          <Route path="/hostels/:hostelId" element={<HostelDetailsView />} />

          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<LoginView />} />

          <Route path="/dashboard" element={<DashboardRedirectView />} />

          <Route path="/profile" element={<MyAccountView />} />
          <Route path="/account" element={<Navigate to="/profile" replace />} />

          <Route path="/saved" element={<RequireAuth><SavedView /></RequireAuth>} />
          <Route path="/requests" element={<RequireAuth><RequestsView /></RequireAuth>} />

          <Route
            path="/owner/dashboard"
            element={
              <RequireAuth>
                <RequireOwner>
                  <OwnerDashboardView />
                </RequireOwner>
              </RequireAuth>
            }
          />
          <Route
            path="/owner/listings"
            element={
              <RequireAuth>
                <RequireOwner>
                  <MyListingsView />
                </RequireOwner>
              </RequireAuth>
            }
          />
          <Route path="/owner/create-hostel" element={<CreatePropertyGateView />} />
          <Route
            path="/owner/hostel/:hostelId/edit"
            element={
              <RequireAuth>
                <RequireOwner>
                  <EditHostelView />
                </RequireOwner>
              </RequireAuth>
            }
          />

          <Route path="/hostels/create" element={<CreatePropertyGateView />} />
          <Route path="/hostels/create/form" element={<CreateHostelView />} />
          <Route path="/hostels/:hostelId/rooms/create" element={<CreateRoomView />} />

          <Route path="/my-listings" element={<Navigate to="/owner/listings" replace />} />

          <Route
            path="/beds/:hostelId/:roomId/:bedNo"
            element={<HostelBedDetailsView />}
          />

          <Route path="*" element={<Navigate to="/hostels" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default function App() {
  return <AppRoutes />
}
