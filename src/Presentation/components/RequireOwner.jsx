import { Navigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/useAuth'
import PageLoadingFallback from './PageLoadingFallback'

export default function RequireOwner({ children }) {
  const { user, authReady } = useAuth()

  if (!authReady) {
    return <PageLoadingFallback />
  }

  if (user?.role !== 'owner') {
    return <Navigate to="/hostels" replace />
  }

  return children
}
