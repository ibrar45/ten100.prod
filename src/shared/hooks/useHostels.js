import { useCallback, useEffect, useState } from 'react'
import { fetchHostels } from '../../features/hostels'

export const useHostels = () => {
  const [hostelList, setHostelList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchHostels()
      setHostelList(Array.isArray(response?.data) ? response.data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load hostels')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { hostelList, loading, error, reload }
}
