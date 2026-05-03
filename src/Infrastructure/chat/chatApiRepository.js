import { apiGet } from '../../shared/apiConfig'

export const createChatApiRepository = () => ({
  /**
   * GET /api/hostels/:hostelId/chat?peerId=:peerId
   */
  async fetchHistory(hostelId, peerId, options = {}) {
    const qs = new URLSearchParams({ peerId: String(peerId) }).toString()
    const response = await apiGet(
      `/hostels/${encodeURIComponent(hostelId)}/chat?${qs}`,
      {
        signal: options.signal,
        token: options.token,
      },
    )

    if (!response?.success) {
      const err = new Error(response?.message || 'Failed to load chat history')
      err.payload = response
      throw err
    }

    return Array.isArray(response.data) ? response.data : []
  },
})
