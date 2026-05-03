import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchHostelBeds, fetchHostelRooms, fetchHostels } from '../../features/hostels'

const FEATURED_PAGE_SIZE = 4

const initialFilters = {
  search: '',
  minPrice: null,
  maxPrice: null,
  minBeds: null,
  area: null,
  genderPolicy: null,
  /** Quick category pills: All | Top Rated | Budget Friendly | … */
  category: 'All',
}

const getLocationFromGoogle = async (latitude, longitude) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
  )
  const payload = await response.json()
  const firstResult = payload?.results?.[0]
  if (!firstResult) return null

  const locality = firstResult.address_components?.find((component) =>
    component.types?.includes('locality'),
  )?.long_name

  const adminArea = firstResult.address_components?.find((component) =>
    component.types?.includes('administrative_area_level_1'),
  )?.long_name

  return locality || adminArea || null
}

export const useDashboardViewModel = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [areaOpen, setAreaOpen] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)
  const [priceMinDraft, setPriceMinDraft] = useState('')
  const [priceMaxDraft, setPriceMaxDraft] = useState('')
  const [visibleHostelCount, setVisibleHostelCount] = useState(6)
  const [featuredStart, setFeaturedStart] = useState(0)
  const [showAllFeatured, setShowAllFeatured] = useState(false)
  /** Hero bar stay dates (YYYY-MM-DD); filter applies on Search when both set. */
  const [stayCheckIn, setStayCheckIn] = useState('')
  const [stayCheckOut, setStayCheckOut] = useState('')
  const [stayRangeApplied, setStayRangeApplied] = useState(false)

  const [hostels, setHostels] = useState([])
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [locationLabel, setLocationLabel] = useState('your location')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [hostelsRes, roomsRes, bedsRes] = await Promise.all([
          fetchHostels(),
          fetchHostelRooms(),
          fetchHostelBeds(),
        ])
        setHostels(hostelsRes?.data ?? [])
        setRooms(roomsRes?.data ?? [])
        setBeds(bedsRes?.data ?? [])
      } catch (loadError) {
        setError(loadError?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    setFeaturedStart(0)
    setVisibleHostelCount(6)
  }, [filters.category, stayRangeApplied])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await getLocationFromGoogle(
            position.coords.latitude,
            position.coords.longitude,
          )
          if (city) setLocationLabel(city)
        } catch {
          // Keep graceful fallback label.
        }
      },
      () => {
        // Permission denied or unavailable, keep fallback.
      },
    )
  }, [])
  const availableBedsByHostelId = useMemo(() => {
    const map = new Map()
    beds.forEach((bed) => {
      if (!bed?.isAvailable) return
      map.set(bed.hostelId, (map.get(bed.hostelId) || 0) + 1)
    })
    return map
  }, [beds])

  const minRentByHostelId = useMemo(() => {
    const map = new Map()
    rooms.forEach((room) => {
      const previous = map.get(room.hostelId)
      if (previous == null || room.rentPerBed < previous) {
        map.set(room.hostelId, room.rentPerBed)
      }
    })
    return map
  }, [rooms])

  const areaOptions = useMemo(
    () =>
      [...new Set(hostels.map((hostel) => hostel.address?.area).filter(Boolean))].sort(),
    [hostels],
  )

  const policyOptions = useMemo(
    () =>
      [...new Set(hostels.map((hostel) => hostel.genderPolicy).filter(Boolean))].sort(),
    [hostels],
  )

  const filteredHostels = useMemo(() => {
    const baseList = hostels.filter((hostel) => {
      const searchable = `${hostel.name} ${hostel.address?.city} ${hostel.address?.area}`
      const availableBeds = availableBedsByHostelId.get(hostel.id) || 0
      const minRent = minRentByHostelId.get(hostel.id) || 0

      if (
        filters.search &&
        !searchable.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }
      if (filters.area && hostel.address?.area !== filters.area) return false
      if (filters.genderPolicy && hostel.genderPolicy !== filters.genderPolicy) return false
      if (filters.minBeds != null && availableBeds < filters.minBeds) return false
      if (filters.minPrice != null && minRent < filters.minPrice) return false
      if (filters.maxPrice != null && minRent > filters.maxPrice) return false
      if (stayRangeApplied && !hostel.isShortStayAvailable) return false

      return true
    })

    const cat = filters.category || 'All'
    if (cat === 'All') return baseList

    const policyText = (value) => String(value || '').toLowerCase()

    const hostelHasDormRoom = (hid) =>
      rooms.some(
        (r) =>
          String(r.hostelId) === String(hid) &&
          (Number(r.totalSeats) > 1 || Number(r.sharingType) > 1),
      )

    const hostelHasPrivateRoom = (hid) =>
      rooms.some(
        (r) =>
          String(r.hostelId) === String(hid) &&
          Number(r.totalSeats) === 1 &&
          Number(r.sharingType) <= 1,
      )

    switch (cat) {
      case 'Top Rated': {
        const rated = baseList.filter((h) => (Number(h.ratingAverage) || 0) >= 3.5)
        if (rated.length) return rated
        const featured = baseList.filter((h) => h.featured)
        return featured.length ? featured : baseList
      }
      case 'Budget Friendly': {
        const rents = baseList
          .map((h) => minRentByHostelId.get(h.id) || 0)
          .filter((r) => r > 0)
          .sort((a, b) => a - b)
        if (!rents.length) return baseList
        const idx = Math.min(Math.max(0, Math.ceil(rents.length * 0.4) - 1), rents.length - 1)
        const cutoff = rents[idx]
        const cheap = baseList.filter((h) => {
          const r = minRentByHostelId.get(h.id) || 0
          return r > 0 && r <= cutoff
        })
        return cheap.length ? cheap : baseList
      }
      case 'Girls Hostel':
        return baseList.filter((h) => {
          const p = policyText(h.genderPolicy)
          return p.includes('girl') || p.includes('female') || p === 'girls'
        })
      case 'Boys Hostel':
        return baseList.filter((h) => {
          const p = policyText(h.genderPolicy)
          return p.includes('boy') || p.includes('male') || p === 'boys'
        })
      case 'Dorm Beds':
        return baseList.filter((h) => hostelHasDormRoom(h.id))
      case 'Private Rooms':
        return baseList.filter((h) => hostelHasPrivateRoom(h.id))
      default:
        return baseList
    }
  }, [availableBedsByHostelId, filters, hostels, minRentByHostelId, rooms, stayRangeApplied])

  const featuredHostels = useMemo(() => {
    const localMatches = filteredHostels.filter(
      (hostel) => hostel.address?.city?.toLowerCase() === locationLabel.toLowerCase(),
    )
    return localMatches.length ? localMatches : filteredHostels
  }, [filteredHostels, locationLabel])

  const canSlideFeatured = !showAllFeatured && featuredHostels.length > FEATURED_PAGE_SIZE
  const normalizedFeaturedStart =
    featuredHostels.length === 0 ? 0 : featuredStart % featuredHostels.length

  const pagedFeaturedHostels = useMemo(() => {
    if (showAllFeatured) return featuredHostels
    if (!canSlideFeatured) return featuredHostels.slice(0, FEATURED_PAGE_SIZE)
    return Array.from({ length: FEATURED_PAGE_SIZE }, (_, index) => {
      const itemIndex = (normalizedFeaturedStart + index) % featuredHostels.length
      return featuredHostels[itemIndex]
    })
  }, [canSlideFeatured, featuredHostels, normalizedFeaturedStart, showAllFeatured])

  const lahoreHostels = useMemo(
    () =>
      filteredHostels
        .filter((hostel) => hostel.address?.city?.toLowerCase().includes('lahore'))
        .slice(0, 4),
    [filteredHostels],
  )

  const availableBeds = useMemo(() => beds.filter((bed) => bed.isAvailable), [beds])

  const roomsByRoomId = useMemo(() => {
    const map = new Map()
    rooms.forEach((r) => {
      if (r?.roomId == null) return
      map.set(String(r.roomId), r)
    })
    return map
  }, [rooms])

  /** Same rules as the rest of the dashboard, plus per-bed price and dorm/private room shape. */
  const filteredAvailableBeds = useMemo(() => {
    const idSet = new Set(filteredHostels.map((h) => String(h.id)))

    let list = availableBeds.filter((bed) => idSet.has(String(bed.hostelId)))

    if (filters.minPrice != null) {
      list = list.filter((b) => (Number(b.seatPrice) || 0) >= filters.minPrice)
    }
    if (filters.maxPrice != null) {
      list = list.filter((b) => (Number(b.seatPrice) || 0) <= filters.maxPrice)
    }

    const cat = filters.category || 'All'
    if (cat === 'Dorm Beds') {
      list = list.filter((b) => {
        const room = roomsByRoomId.get(String(b.roomId))
        if (!room) return false
        return Number(room.totalSeats) > 1 || Number(room.sharingType) > 1
      })
    } else if (cat === 'Private Rooms') {
      list = list.filter((b) => {
        const room = roomsByRoomId.get(String(b.roomId))
        if (!room) return false
        return Number(room.totalSeats) === 1 && Number(room.sharingType) <= 1
      })
    }

    return list
  }, [
    availableBeds,
    filteredHostels,
    filters.category,
    filters.maxPrice,
    filters.minPrice,
    roomsByRoomId,
  ])

  useEffect(() => {
    setVisibleHostelCount((prev) => {
      const n = filteredAvailableBeds.length
      if (n === 0) return 6
      return Math.min(prev, n)
    })
  }, [filteredAvailableBeds])

  const hasActiveFilters =
    stayRangeApplied ||
    Object.values(filters).some((value) => {
      if (value === null || value === '') return false
      if (value === 'All') return false
      return true
    })

  const clearFilters = () => {
    setFilters(initialFilters)
    setPriceMinDraft('')
    setPriceMaxDraft('')
    setStayCheckIn('')
    setStayCheckOut('')
    setStayRangeApplied(false)
  }

  const applyHeroSearch = () => {
    setShowFilters((prev) => !prev)
    const inD = stayCheckIn.trim()
    const outD = stayCheckOut.trim()
    if (!inD || !outD) {
      setStayRangeApplied(false)
      return
    }
    const t0 = Date.parse(inD)
    const t1 = Date.parse(outD)
    if (Number.isNaN(t0) || Number.isNaN(t1) || t1 < t0) {
      setStayRangeApplied(false)
      return
    }
    setStayRangeApplied(true)
  }

  const cycleMinBeds = () => {
    const steps = [null, 1, 2, 3, 4]
    const i = steps.findIndex((x) => x === filters.minBeds)
    setFilters((prev) => ({ ...prev, minBeds: steps[(i + 1) % steps.length] }))
  }

  const handleFeaturedPrev = () => {
    if (!canSlideFeatured) return
    setFeaturedStart(
      (prev) => (prev - FEATURED_PAGE_SIZE + featuredHostels.length) % featuredHostels.length,
    )
  }

  const handleFeaturedNext = () => {
    if (!canSlideFeatured) return
    setFeaturedStart((prev) => (prev + FEATURED_PAGE_SIZE) % featuredHostels.length)
  }

  const toggleSeeAllFeatured = () => {
    setShowAllFeatured((prev) => !prev)
    setFeaturedStart(0)
  }

  const goToHostel = (hostelId) => navigate(`/hostel/${hostelId}`)
  const goToBed = (bed) => navigate(`/beds/${bed.hostelId}/${bed.roomId}/${bed.bedNo}`)

  return {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    priceOpen,
    setPriceOpen,
    areaOpen,
    setAreaOpen,
    policyOpen,
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
    lahoreHostels,
    availableBeds,
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
  }
}
