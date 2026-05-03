import { Navigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/useAuth'
import PageLoadingFallback from '../components/PageLoadingFallback'

export default function DashboardRedirectView() {
  const { user, authReady } = useAuth()

  if (!authReady) {
    return <PageLoadingFallback />
  }

  if (user?.role === 'owner') {
    return <Navigate to="/owner/dashboard" replace />
  }

  return <Navigate to="/hostels" replace />
}
