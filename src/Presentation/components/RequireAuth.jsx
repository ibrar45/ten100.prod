import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../shared/context/useAuth'
import PageLoadingFallback from './PageLoadingFallback'

export default function RequireAuth({ children }) {
  const { isAuthenticated, authReady } = useAuth()
  const location = useLocation()

  if (!authReady) {
    return <PageLoadingFallback />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  return children
}
