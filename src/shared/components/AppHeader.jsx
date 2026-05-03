import { useEffect, useRef, useState } from 'react'
import {
  BarChart3,
  Building2,
  BriefcaseBusiness,
  Heart,
  LogIn,
  LogOut,
  User,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../../application/auth/authService'
import { useAuth } from '../context/useAuth'

function isHeaderNavItemActive(itemKey, pathname) {
  if (itemKey === 'owner-dashboard') return pathname.startsWith('/owner/dashboard')
  if (itemKey === 'my-listings') return pathname.startsWith('/owner/listings')
  if (itemKey === 'account')
    return pathname === '/profile' || pathname === '/account'
  if (itemKey === 'saved') return pathname === '/saved'
  if (itemKey === 'bookings') return pathname === '/requests'
  return false
}

export default function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, clearAuthUser } = useAuth()
  const isOwner = user?.role === 'owner'
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const menuItems = isAuthenticated
    ? [
        ...(user?.role === 'owner'
          ? [{ key: 'owner-dashboard', label: 'Dashboard', icon: <BarChart3 size={19} /> }]
          : []),
        { key: 'account', label: 'My account', icon: <User size={19} /> },
        ...(user?.role === 'owner'
          ? [{ key: 'my-listings', label: 'My Listings', icon: <Building2 size={19} /> }]
          : []),
        { key: 'bookings', label: 'Bookings', icon: <BriefcaseBusiness size={19} /> },
        { key: 'saved', label: 'Saved', icon: <Heart size={19} /> },
        { key: 'signout', label: 'Sign out', icon: <LogOut size={19} /> },
      ]
    : [
        { key: 'login', label: 'Login', icon: <LogIn size={19} /> },
        { key: 'saved', label: 'Saved', icon: <Heart size={19} /> },
      ]

  const onMenuItemClick = async (itemKey) => {
    if (itemKey === 'login') {
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      })
      setMenuOpen(false)
      return
    }
    if (itemKey === 'account') {
      navigate('/profile')
      setMenuOpen(false)
      return
    }
    if (itemKey === 'owner-dashboard') {
      navigate('/owner/dashboard')
      setMenuOpen(false)
      return
    }
    if (itemKey === 'my-listings') {
      navigate('/owner/listings')
      setMenuOpen(false)
      return
    }
    if (itemKey === 'bookings') {
      navigate('/requests')
      setMenuOpen(false)
      return
    }
    if (itemKey === 'saved') {
      if (!isAuthenticated) {
        navigate('/login', {
          state: {
            from: `${location.pathname}${location.search}${location.hash}`,
          },
        })
      } else {
        navigate('/saved')
      }
      setMenuOpen(false)
      return
    }
    if (itemKey === 'signout') {
      try {
        await logoutUser()
      } finally {
        clearAuthUser()
      }
      setMenuOpen(false)
      return
    }
    setMenuOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-none'
      }`}
    >
      <div className="w-full px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/hostels')}
            className="flex items-center"
          >
            <img
              src="/src/assets/logo.png"
              alt="TEN100 logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <p className="ml-2 text-sm font-bold text-black">TEN100.pk</p>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(isOwner ? '/owner/create-hostel' : '/hostels/create')}
              className="h-10 rounded-lg border border-green-500 bg-teal-800 px-4 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-900 hover:shadow-md active:translate-y-0"
            >
              Create Property
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm transition-shadow duration-200 hover:border-slate-300 hover:shadow-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-xs font-semibold text-white">
                  {isAuthenticated ? (
                    (user?.username || 'US').slice(0, 2).toUpperCase()
                  ) : (
                    <User size={14} />
                  )}
                </span>
                <span className="text-xs text-slate-500">▾</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-[60] mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl ring-1 ring-black/5 transition-all duration-200">
                  {menuItems.map((item) => {
                    const isActive = isHeaderNavItemActive(item.key, location.pathname)
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onMenuItemClick(item.key)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left font-medium transition-colors duration-150 ${
                          isActive
                            ? 'bg-teal-50 text-teal-900'
                            : 'text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span className={isActive ? 'text-teal-700' : 'text-slate-700'}>
                          {item.icon}
                        </span>
                        <span className="text-[18px] leading-none">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
