import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchHostelBedDetails,
  fetchHostelDetails,
  requestHostelRoom,
  trackHostelCallClick,
} from '../../features/hostels'
import { useAuth } from '../../shared/context/useAuth'

const bedDetailsHasDialPhone = (bed) => {
  const o = `${bed?.owner?.profile?.phoneNumber || ''}`.trim()
  const c = `${bed?.contact?.phone || ''}`.trim()
  return Boolean(o || c)
}

/**
 * Bed GET is often sparse; hostel GET carries listing owner + contact (same as hostel detail screen).
 */
const enrichBedDetailsFromHostel = (bedDetails, hostelDetails, roomId) => {
  if (!bedDetails || !hostelDetails) return bedDetails
  let next = { ...bedDetails }

  const rid = String(roomId ?? '')
  const rooms = hostelDetails.rooms ?? []
  const match = rooms.find((r) => String(r.id) === rid)
  const roomImages = Array.isArray(match?.images) ? match.images : []
  if (!Array.isArray(next.images) || next.images.length === 0) {
    if (roomImages.length) next = { ...next, images: roomImages }
    else if (Array.isArray(hostelDetails.images) && hostelDetails.images.length) {
      next = { ...next, images: hostelDetails.images }
    }
  }

  if (hostelDetails.id && !String(next.hostelId ?? '').trim()) {
    next = { ...next, hostelId: String(hostelDetails.id) }
  }

  const ho = hostelDetails.owner
  const hc = hostelDetails.contact
  const hOwnerPhone = `${ho?.profile?.phoneNumber || ''}`.trim()
  const hContactPhone = `${hc?.phone || ''}`.trim()
  const missingOwnerId = !String(next.owner?.id ?? '').trim()
  const missingPhone = !bedDetailsHasDialPhone(next)

  if (ho && (missingOwnerId || missingPhone)) {
    next = {
      ...next,
      owner: {
        id: ho.id ?? next.owner?.id ?? '',
        username: ho.username ?? next.owner?.username ?? '',
        email: ho.email ?? next.owner?.email ?? '',
        profile: {
          firstName: ho.profile?.firstName ?? next.owner?.profile?.firstName ?? '',
          lastName: ho.profile?.lastName ?? next.owner?.profile?.lastName ?? '',
          phoneNumber: hOwnerPhone || next.owner?.profile?.phoneNumber || '',
        },
      },
    }
  }

  if (!bedDetailsHasDialPhone(next) && hContactPhone) {
    next = {
      ...next,
      contact: {
        phone: hContactPhone || next.contact?.phone || '',
        email: hc?.email ?? next.contact?.email ?? '',
      },
    }
  }

  return next
}

export const useHostelBedDetailsViewModel = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { hostelId, roomId, bedNo } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [details, setDetails] = useState(null)
  const [requestMessage, setRequestMessage] = useState(
    'Hi, I am interested in this room. Can I visit?',
  )
  const [requesting, setRequesting] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState('')
  const [actionError, setActionError] = useState('')
  const [trackingCall, setTrackingCall] = useState(false)

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchHostelBedDetails(hostelId, roomId, bedNo)
        let next = response?.data ?? null

        const needsImages =
          Boolean(next && hostelId && roomId) &&
          (!Array.isArray(next.images) || next.images.length === 0)
        const needsHostelOwnerPhone = Boolean(next && hostelId && !bedDetailsHasDialPhone(next))
        const needsOwnerIdForChat = Boolean(
          next &&
            hostelId &&
            !String(next?.owner?.id ?? next?.owner?._id ?? '').trim(),
        )

        if (next && hostelId && (needsImages || needsHostelOwnerPhone || needsOwnerIdForChat)) {
          try {
            const hostelRes = await fetchHostelDetails(hostelId)
            next = enrichBedDetailsFromHostel(next, hostelRes?.data, roomId)
          } catch {
            /* optional enrichment */
          }
        }

        setDetails(next)
      } catch (loadError) {
        setError(loadError?.message || 'Failed to load bed details')
      } finally {
        setLoading(false)
      }
    }

    loadDetails()
  }, [bedNo, hostelId, roomId])

  const displayAddress = useMemo(() => {
    if (!details) return ''
    return `${details.hostelAddress.street}, ${details.hostelAddress.area}, ${details.hostelAddress.city}`
  }, [details])

  const mapEmbedUrl = useMemo(() => {
    if (!details) return ''
    const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const mapQuery = encodeURIComponent(`${details.hostelName}, ${displayAddress}`)
    return mapsApiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${mapQuery}`
      : `https://www.google.com/maps?q=${mapQuery}&output=embed`
  }, [details, displayAddress])

  const goBackToDashboard = () => navigate('/hostels')

  const submitRoomRequest = async () => {
    if (!hostelId || !roomId) return
    const trimmed = requestMessage.trim()
    if (!trimmed) {
      setActionError('Message is required.')
      return false
    }
    if (trimmed.length > 2000) {
      setActionError('Request message must be 2000 characters or less.')
      return false
    }

    setActionError('')
    setRequestSuccess('')
    setRequesting(true)
    try {
      const response = await requestHostelRoom(hostelId, roomId, {
        message: trimmed || undefined,
      })
      setRequestSuccess(response?.message || 'Request sent successfully.')
      setRequestMessage('')
      return true
    } catch (requestError) {
      setActionError(requestError?.message || 'Failed to send request')
      return false
    } finally {
      setRequesting(false)
    }
  }

  const logCallClick = async () => {
    if (!hostelId) return
    setActionError('')
    setTrackingCall(true)
    try {
      await trackHostelCallClick(hostelId)
    } catch (trackError) {
      setActionError(trackError?.message || 'Failed to track call click')
      throw trackError
    } finally {
      setTrackingCall(false)
    }
  }

  const canRequestRoom =
    isAuthenticated && user?.role !== 'owner' && user?.role !== 'hostel_owner'
  const isOwnerUser = user?.role === 'owner' || user?.role === 'hostel_owner'

  return {
    details,
    loading,
    error,
    displayAddress,
    mapEmbedUrl,
    goBackToDashboard,
    requestMessage,
    setRequestMessage,
    submitRoomRequest,
    requesting,
    requestSuccess,
    actionError,
    trackingCall,
    logCallClick,
    canRequestRoom,
    isOwnerUser,
  }
}
