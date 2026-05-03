import { useEffect, useMemo, useState } from 'react'
import { fetchOwnerDashboardAnalytics } from '../../features/hostels'

const asNum = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)
const asArray = (value) => (Array.isArray(value) ? value : [])

export const useOwnerDashboardViewModel = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchOwnerDashboardAnalytics()
        if (active) setAnalytics(response?.data ?? {})
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Failed to load dashboard analytics')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const topStats = useMemo(() => {
    const listingStats = analytics?.listingStats
    const requestAnalytics = analytics?.requestAnalytics
    const callAnalytics = analytics?.callAnalytics
    const chatActivity = analytics?.chatActivity

    return {
      totalListings: asNum(listingStats?.totalListings ?? listingStats?.total ?? 0),
      publishedHostels: asNum(listingStats?.publishedHostels ?? listingStats?.published ?? 0),
      totalRequests: asNum(requestAnalytics?.totalRequests ?? requestAnalytics?.total ?? 0),
      totalCalls: asNum(callAnalytics?.totalCalls ?? callAnalytics?.total ?? 0),
      chatMessages: asNum(
        chatActivity?.totalMessages ?? chatActivity?.messages ?? chatActivity?.total ?? 0,
      ),
    }
  }, [analytics])

  const requestSummary = useMemo(() => {
    const requestAnalytics = analytics?.requestAnalytics
    return {
      total: asNum(requestAnalytics?.totalRequests ?? requestAnalytics?.total ?? 0),
      pending: asNum(requestAnalytics?.pendingRequests ?? requestAnalytics?.pending ?? 0),
      responded: asNum(requestAnalytics?.respondedRequests ?? requestAnalytics?.responded ?? 0),
      today: asNum(requestAnalytics?.todayRequests ?? requestAnalytics?.today ?? 0),
    }
  }, [analytics])

  const growth = useMemo(() => {
    const weeklyGrowth = analytics?.weeklyGrowth
    return {
      viewsThisWeek: asNum(weeklyGrowth?.viewsThisWeek),
      viewsLastWeek: asNum(weeklyGrowth?.viewsLastWeek),
      requestsThisWeek: asNum(weeklyGrowth?.requestsThisWeek),
      requestsLastWeek: asNum(weeklyGrowth?.requestsLastWeek),
      callsThisWeek: asNum(weeklyGrowth?.callsThisWeek),
      callsLastWeek: asNum(weeklyGrowth?.callsLastWeek),
    }
  }, [analytics])

  const recentActivity = useMemo(() => {
    const requestAnalytics = analytics?.requestAnalytics
    const callAnalytics = analytics?.callAnalytics
    const chatActivity = analytics?.chatActivity

    const recentRequests = asArray(
      requestAnalytics?.recentRequests ?? requestAnalytics?.recent,
    ).map((item, index) => ({
      id: item?.id ?? item?._id ?? `req-${index}`,
      type: 'Request',
      label: item?.hostelName ?? item?.hostel ?? 'Hostel request',
      time: item?.createdAt ?? item?.timestamp ?? '',
    }))
    const recentCalls = asArray(callAnalytics?.recentCalls ?? callAnalytics?.recent).map(
      (item, index) => ({
        id: item?.id ?? item?._id ?? `call-${index}`,
        type: 'Call',
        label: item?.hostelName ?? item?.hostel ?? 'Hostel call',
        time: item?.createdAt ?? item?.timestamp ?? '',
      }),
    )
    const recentMessages = asArray(
      chatActivity?.recentMessages ?? chatActivity?.recent,
    ).map((item, index) => ({
      id: item?.id ?? item?._id ?? `msg-${index}`,
      type: 'Chat',
      label: item?.hostelName ?? item?.hostel ?? 'Chat message',
      time: item?.createdAt ?? item?.timestamp ?? '',
    }))

    return [...recentRequests, ...recentCalls, ...recentMessages]
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
      .slice(0, 8)
  }, [analytics])

  return {
    loading,
    error,
    topStats,
    requestSummary,
    growth,
    recentActivity,
  }
}
