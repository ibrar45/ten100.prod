import { useCallback, useEffect, useState } from 'react'
import { fetchOwnerRequestsInbox, respondToOwnerRequest } from '../../features/hostels'

export const useOwnerRequestsInboxViewModel = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [respondingRequestId, setRespondingRequestId] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const loadRequests = useCallback(async (activeRef = { current: true }) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchOwnerRequestsInbox()
      if (activeRef.current) setRequests(Array.isArray(response?.data) ? response.data : [])
    } catch (loadError) {
      if (activeRef.current) setError(loadError?.message || 'Failed to load requests')
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const activeRef = { current: true }
    void loadRequests(activeRef)
    return () => {
      activeRef.current = false
    }
  }, [loadRequests])

  const respondToRequest = useCallback(async ({ requestId, status, note = '' }) => {
    if (!requestId || !status) return
    setRespondingRequestId(requestId)
    setError('')

    const previousRequests = requests
    setRequests((prev) =>
      prev.map((item) => (item.id === requestId ? { ...item, status, note } : item)),
    )

    try {
      await respondToOwnerRequest({ requestId, status, note })
      setToastMessage(status === 'accepted' ? 'Request accepted' : 'Request rejected')
    } catch (submitError) {
      setRequests(previousRequests)
      setError(submitError?.message || 'Failed to respond to request')
      throw submitError
    } finally {
      setRespondingRequestId('')
    }
  }, [requests])

  return {
    requests,
    loading,
    error,
    toastMessage,
    respondingRequestId,
    retryLoadRequests: () => loadRequests({ current: true }),
    clearToast: () => setToastMessage(''),
    respondToRequest,
  }
}
