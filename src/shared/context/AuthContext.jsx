import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContextValue'
import { fetchCurrentUser } from '../../application/auth/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let active = true

    const restore = async () => {
      try {
        const response = await fetchCurrentUser()
        if (active) {
          setUser(response?.user || null)
        }
      } catch {
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setAuthReady(true)
        }
      }
    }

    restore()
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      setAuthUser: setUser,
      clearAuthUser: () => setUser(null),
    }),
    [authReady, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
