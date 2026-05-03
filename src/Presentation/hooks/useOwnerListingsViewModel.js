import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteHostel, fetchMyHostels, publishHostel } from '../../features/hostels'

export const useOwnerListingsViewModel = () => {
  const navigate = useNavigate()
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [listingAction, setListingAction] = useState({ id: '', type: '' })

  const loadListings = useCallback(async (activeRef = { current: true }) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchMyHostels()
      if (activeRef.current) setMyListings(response?.data ?? [])
    } catch (e) {
      if (activeRef.current) setError(e?.message || 'Failed to load listings')
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const activeRef = { current: true }
    void loadListings(activeRef)
    return () => {
      activeRef.current = false
    }
  }, [loadListings])

  const goToEditHostel = (hostelId) => navigate(`/owner/hostel/${hostelId}/edit`)
  const goToCreateHostel = () => navigate('/owner/create-hostel')
  const goToHostel = (hostelId) => navigate(`/hostel/${hostelId}`)

  const onPublishListing = async (hostelId) => {
    setListingAction({ id: hostelId, type: 'publish' })
    setError('')
    try {
      await publishHostel(hostelId)
      setMyListings((prev) =>
        prev.map((listing) =>
          listing.id === hostelId
            ? { ...listing, listingStatus: 'published', isActive: true }
            : listing,
        ),
      )
    } catch (actionError) {
      setError(actionError?.message || 'Failed to publish listing')
    } finally {
      setListingAction({ id: '', type: '' })
    }
  }

  const onDeleteListing = async (hostelId) => {
    setListingAction({ id: hostelId, type: 'delete' })
    setError('')
    try {
      await deleteHostel(hostelId)
      setMyListings((prev) => prev.filter((listing) => listing.id !== hostelId))
    } catch (actionError) {
      setError(actionError?.message || 'Failed to delete listing')
    } finally {
      setListingAction({ id: '', type: '' })
    }
  }

  return {
    myListings,
    loading,
    error,
    listingAction,
    goToHostel,
    goToEditHostel,
    goToCreateHostel,
    retryLoadListings: () => loadListings({ current: true }),
    onPublishListing,
    onDeleteListing,
  }
}
