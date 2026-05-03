import { useCallback, useEffect, useMemo, useState } from 'react'

const KEY = 'ten100.savedItems.v1'

const emptyState = { hostels: [], beds: [] }

const readSavedState = () => {
  if (typeof window === 'undefined') return emptyState
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw)
    return {
      hostels: Array.isArray(parsed?.hostels) ? parsed.hostels : [],
      beds: Array.isArray(parsed?.beds) ? parsed.beds : [],
    }
  } catch {
    return emptyState
  }
}

const writeSavedState = (state) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(state))
}

export const useLocalSavedItems = () => {
  const [savedData, setSavedData] = useState(emptyState)

  useEffect(() => {
    setSavedData(readSavedState())
  }, [])

  const setAndPersist = useCallback((updater) => {
    setSavedData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      writeSavedState(next)
      return next
    })
  }, [])

  const isHostelSaved = useCallback(
    (hostelId) => savedData.hostels.some((h) => String(h.id) === String(hostelId)),
    [savedData.hostels],
  )

  const bedKey = useCallback(
    (bed) => `${bed?.hostelId ?? ''}:${bed?.roomId ?? ''}:${bed?.bedNo ?? ''}`,
    [],
  )

  const isBedSaved = useCallback(
    (bed) => savedData.beds.some((b) => b.key === bedKey(bed)),
    [bedKey, savedData.beds],
  )

  const toggleSavedHostel = useCallback(
    (hostelSummary) => {
      const id = String(hostelSummary?.id || '')
      if (!id) return false
      let nowSaved = false
      setAndPersist((prev) => {
        const exists = prev.hostels.some((h) => String(h.id) === id)
        if (exists) {
          nowSaved = false
          return {
            ...prev,
            hostels: prev.hostels.filter((h) => String(h.id) !== id),
          }
        }
        nowSaved = true
        return {
          ...prev,
          hostels: [
            {
              id,
              name: hostelSummary?.name || '',
              image: hostelSummary?.image || '',
              area: hostelSummary?.area || '',
              city: hostelSummary?.city || '',
              minRent: Number(hostelSummary?.minRent) || 0,
            },
            ...prev.hostels,
          ],
        }
      })
      return nowSaved
    },
    [setAndPersist],
  )

  const toggleSavedBed = useCallback(
    (bedSummary) => {
      const key = bedKey(bedSummary)
      if (key === '::') return false
      let nowSaved = false
      setAndPersist((prev) => {
        const exists = prev.beds.some((b) => b.key === key)
        if (exists) {
          nowSaved = false
          return {
            ...prev,
            beds: prev.beds.filter((b) => b.key !== key),
          }
        }
        nowSaved = true
        return {
          ...prev,
          beds: [
            {
              key,
              hostelId: String(bedSummary?.hostelId || ''),
              roomId: String(bedSummary?.roomId || ''),
              bedNo: Number(bedSummary?.bedNo) || 0,
              roomNo: bedSummary?.roomNo || '',
              hostelName: bedSummary?.hostelName || '',
              image: bedSummary?.image || '',
              seatPrice: Number(bedSummary?.seatPrice) || 0,
            },
            ...prev.beds,
          ],
        }
      })
      return nowSaved
    },
    [bedKey, setAndPersist],
  )

  const removeSavedHostel = useCallback(
    (hostelId) => {
      const id = String(hostelId || '')
      setAndPersist((prev) => ({
        ...prev,
        hostels: prev.hostels.filter((h) => String(h.id) !== id),
      }))
    },
    [setAndPersist],
  )

  const removeSavedBed = useCallback(
    (bed) => {
      const key = typeof bed === 'string' ? bed : bedKey(bed)
      setAndPersist((prev) => ({
        ...prev,
        beds: prev.beds.filter((b) => b.key !== key),
      }))
    },
    [bedKey, setAndPersist],
  )

  return useMemo(
    () => ({
      savedHostels: savedData.hostels,
      savedBeds: savedData.beds,
      isHostelSaved,
      isBedSaved,
      toggleSavedHostel,
      toggleSavedBed,
      removeSavedHostel,
      removeSavedBed,
    }),
    [
      isBedSaved,
      isHostelSaved,
      removeSavedBed,
      removeSavedHostel,
      savedData.beds,
      savedData.hostels,
      toggleSavedBed,
      toggleSavedHostel,
    ],
  )
}
