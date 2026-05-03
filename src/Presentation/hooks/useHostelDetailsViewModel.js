import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchHostelBeds, fetchHostelDetails } from '../../features/hostels'

const mergeRoomsWithBeds = (details, globalBedRows, hostelId) => {
  const rooms = details?.rooms
  if (!Array.isArray(rooms)) return []

  return rooms.map((room) => {
    let beds = Array.isArray(room.beds) && room.beds.length ? [...room.beds] : []

    if (!beds.length && Array.isArray(globalBedRows) && globalBedRows.length && hostelId) {
      beds = globalBedRows
        .filter(
          (b) =>
            String(b.hostelId) === String(hostelId) && String(b.roomId) === String(room.id),
        )
        .sort((a, b) => (a.bedNo || 0) - (b.bedNo || 0))
        .map((b) => ({
          id: b.bedId || '',
          bedNo: b.bedNo,
          status: b.status,
          listed: b.isListed,
        }))
    }

    const total = Number(room.totalSeats) || 0
    const avail = Number(room.availableSeats) || 0
    if (!beds.length && total > 0) {
      beds = Array.from({ length: total }, (_, i) => ({
        id: '',
        bedNo: i + 1,
        status: i < avail ? 'available' : 'occupied',
        listed: true,
      }))
    }

    return { ...room, beds }
  })
}

export const useHostelDetailsViewModel = () => {
  const { hostelId, id } = useParams()
  const resolvedHostelId = hostelId ?? id
  const [details, setDetails] = useState(null)
  const [globalBedRows, setGlobalBedRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!resolvedHostelId) {
      let cancelled = false
      const t = window.setTimeout(() => {
        if (cancelled) return
        setLoading(false)
        setError('Missing hostel id')
        setDetails(null)
      }, 0)
      return () => {
        cancelled = true
        window.clearTimeout(t)
      }
    }

    let ignore = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const detailsResponse = await fetchHostelDetails(resolvedHostelId)
        if (!ignore) setDetails(detailsResponse?.data ?? null)

        let globalRows = []
        try {
          const bedsResponse = await fetchHostelBeds()
          globalRows = Array.isArray(bedsResponse?.data) ? bedsResponse.data : []
        } catch {
          // Public page: bed list may be restricted; fall back to room.totalSeats placeholders
        }
        if (!ignore) setGlobalBedRows(globalRows)
      } catch (loadError) {
        if (!ignore) setError(loadError?.message || 'Failed to load hostel details')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [resolvedHostelId])

  const roomsWithBeds = useMemo(
    () => mergeRoomsWithBeds(details, globalBedRows, resolvedHostelId),
    [details, globalBedRows, resolvedHostelId],
  )

  const mapQuery = useMemo(() => {
    if (!details) return ''
    return encodeURIComponent(
      `${details.name}, ${details.address.street}, ${details.address.area}, ${details.address.city}`,
    )
  }, [details])

  return {
    details,
    roomsWithBeds,
    loading,
    error,
    mapQuery,
  }
}
