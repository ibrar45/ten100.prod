import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchSavedItems, removeSavedItem, saveItem } from '../../../features/saved'
import { isItemSaved, toggleSaveState } from '../../../domain/saved/savedUtils'
import { useAuth } from '../../../shared/context/useAuth'

let savedHostelIdCache = new Set()
let savedPayloadCache = { hostels: [], beds: [] }
let cacheHydrated = false
const listeners = new Set()

const emit = () => {
  listeners.forEach((fn) => fn(savedHostelIdCache, savedPayloadCache))
}

export const useSavedItems = () => {
  const { isAuthenticated } = useAuth()
  const [savedHostelIds, setSavedHostelIds] = useState(new Set(savedHostelIdCache))
  const [savedPayload, setSavedPayload] = useState(savedPayloadCache)
  const [pendingById, setPendingById] = useState({})
  const [loading, setLoading] = useState(!cacheHydrated && isAuthenticated)
  const [error, setError] = useState('')

  useEffect(() => {
    const sync = (ids, payload) => {
      setSavedHostelIds(new Set(ids))
      setSavedPayload(payload)
    }
    listeners.add(sync)
    return () => {
      listeners.delete(sync)
    }
  }, [])

  const hydrate = useCallback(async () => {
    if (!isAuthenticated) {
      savedHostelIdCache = new Set()
      savedPayloadCache = { hostels: [], beds: [] }
      cacheHydrated = false
      emit()
      setLoading(false)
      setError('')
      return
    }

    if (cacheHydrated) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetchSavedItems()
      const payload = response?.data ?? { hostels: [], beds: [] }
      const ids = new Set((payload.hostels || []).map((h) => String(h.id)).filter(Boolean))
      savedHostelIdCache = ids
      savedPayloadCache = payload
      cacheHydrated = true
      emit()
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('[saved] fetchSavedItems failed', e)
      }
      setError(e?.message || 'Failed to load saved items')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const reloadSaved = useCallback(async () => {
    if (!isAuthenticated) return
    cacheHydrated = false
    await hydrate()
  }, [hydrate, isAuthenticated])

  const toggleHostelSaved = useCallback(
    async (hostelId) => {
      const key = String(hostelId || '')
      if (!key) return { ok: false, reason: 'missing-item' }
      if (!isAuthenticated) {
        return { ok: false, reason: 'unauthenticated' }
      }

      setError('')
      setPendingById((prev) => ({ ...prev, [key]: true }))

      const before = new Set(savedHostelIdCache)
      const beforePayload = savedPayloadCache

      const { nextSavedItems, isSaved } = toggleSaveState(savedHostelIdCache, key)
      savedHostelIdCache = nextSavedItems

      if (!isSaved) {
        savedPayloadCache = {
          ...savedPayloadCache,
          hostels: (savedPayloadCache.hostels || []).filter((h) => String(h.id) !== key),
        }
      }
      emit()

      try {
        if (isSaved) {
          await saveItem('hostel', key)
          const refreshed = await fetchSavedItems()
          const payload = refreshed?.data ?? { hostels: [], beds: [] }
          savedPayloadCache = payload
          savedHostelIdCache = new Set((payload.hostels || []).map((h) => String(h.id)))
          cacheHydrated = true
          emit()
        } else {
          await removeSavedItem('hostel', key)
        }
        return { ok: true, isSaved }
      } catch (e) {
        savedHostelIdCache = before
        savedPayloadCache = beforePayload
        emit()
        const message = e?.message || 'Failed to update saved items'
        setError(message)
        return { ok: false, reason: 'request-failed', message }
      } finally {
        setPendingById((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    },
    [isAuthenticated],
  )

  return {
    loading,
    error,
    savedData: savedPayload,
    savedHostels: savedPayload?.hostels || [],
    savedBeds: savedPayload?.beds || [],
    reloadSaved,
    toggleHostelSaved,
    isHostelSaved: (hostelId) => isItemSaved(savedHostelIds, hostelId),
    isPending: (hostelId) => Boolean(pendingById[String(hostelId || '')]),
    hasAnySavedItems:
      (savedPayload?.hostels?.length || 0) > 0 || (savedPayload?.beds?.length || 0) > 0,
  }
}