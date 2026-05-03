import { apiDelete, apiGet, apiPatchRaw, apiPostForm, apiPostRaw } from '../../shared/apiConfig'
import { mapHostelBedDetailsFromApi } from '../../Domain/hostels/hostelBedDetailsMapper'
import { mapHostelDetailsFromApi } from '../../Domain/hostels/hostelDetailsMapper'
import { mapHostelFromApi } from '../../Domain/hostels/hostelMappers'
import { mapHostelBedFromApi } from '../../Domain/hostels/hostelBedMappers'
import { mapHostelRoomFromApi } from '../../Domain/hostels/hostelRoomMappers'
import { mapRoomRequestFromApi } from '../../Domain/hostels/roomRequestMappers'

export const createHostelsApiRepository = () => ({
  /**
   * GET /api/hostels/ — path is /hostels/ because API_BASE_URL ends with /api
   */
  async list({ token, signal } = {}) {
    const response = await apiGet('/hostels/', { token, signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load hostels')
      error.payload = response
      throw error
    }

    const rows = Array.isArray(response.data) ? response.data : []

    return {
      success: true,
      data: rows.map(mapHostelFromApi),
    }
  },

  /**
   * GET /api/hostels/my
   */
  async listMine({ token, signal } = {}) {
    const response = await apiGet('/hostels/my', { token, signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load your listings')
      error.payload = response
      throw error
    }

    const rows = Array.isArray(response.data) ? response.data : []
    return {
      success: true,
      data: rows.map(mapHostelFromApi),
    }
  },

  /**
   * GET /api/hostels/:hostelId
   */
  async getById(hostelId, { token, signal } = {}) {
    const response = await apiGet(`/hostels/${hostelId}`, { token, signal })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load hostel details')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: mapHostelDetailsFromApi(response.data),
    }
  },

  /**
   * GET /api/hostels/rooms
   */
  async listRooms({ token, signal } = {}) {
    const response = await apiGet('/hostels/rooms', { token, signal })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load hostel rooms')
      error.payload = response
      throw error
    }

    const rows = Array.isArray(response.data) ? response.data : []
    const count =
      typeof response.meta?.count === 'number' ? response.meta.count : rows.length

    return {
      success: true,
      meta: { count },
      data: rows.map(mapHostelRoomFromApi),
    }
  },

  /**
   * GET /api/hostels/rooms/beds — all beds
   */
  async listBeds({ token, signal } = {}) {
    const response = await apiGet('/hostels/rooms/beds', { token, signal })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load hostel beds')
      error.payload = response
      throw error
    }

    const rows = Array.isArray(response.data) ? response.data : []
    const count =
      typeof response.meta?.count === 'number' ? response.meta.count : rows.length
    return {
      success: true,
      meta: { count },
      data: rows.map(mapHostelBedFromApi),
    }
  },

  /**
   * PATCH /api/beds/:bedId
   */
  async patchBed(bedId, payload = {}, { token, signal } = {}) {
    const response = await apiPatchRaw(`/beds/${bedId}`, payload, {
      token,
      signal,
    })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to update bed')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response?.data ?? null,
      message: response?.message ?? 'Bed updated',
    }
  },

  /**
   * GET /api/hostels/rooms/beds/:hostelId/:roomId/:bedNo
   */
  async getBedDetails(hostelId, roomId, bedNo, { token, signal } = {}) {
    const response = await apiGet(
      `/hostels/rooms/beds/${hostelId}/${roomId}/${bedNo}`,
      { token, signal },
    )

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load bed details')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: mapHostelBedDetailsFromApi(response.data),
    }
  },

  /**
   * POST /api/hostels/create
   */
  async create(formData, { token, signal } = {}) {
    const response = await apiPostForm('/hostels/create', formData, {
      token,
      signal,
    })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to create hostel')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Hostel created successfully',
    }
  },

  /**
   * PATCH /api/hostels/:hostelId
   */
  async update(hostelId, payload, { token, signal } = {}) {
    const response = await apiPatchRaw(`/hostels/${hostelId}`, payload, {
      token,
      signal,
    })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to update hostel')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Hostel updated successfully',
    }
  },

  /**
   * DELETE /api/hostels/:hostelId
   */
  async remove(hostelId, { token, signal } = {}) {
    const response = await apiDelete(`/hostels/${hostelId}`, {
      token,
      signal,
    })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to delete hostel')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Hostel deleted successfully',
    }
  },

  /**
   * POST /api/hostels/:hostelId/rooms
   */
  async createRoom(hostelId, payload, { token, signal } = {}) {
    const response = await apiPostRaw(`/hostels/${hostelId}/rooms`, payload, {
      token,
      signal,
    })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to create room')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Room added successfully',
    }
  },

  /**
   * PATCH /api/hostels/:hostelId/publish
   */
  async publish(hostelId, { token, signal } = {}) {
    const response = await apiPatchRaw(`/hostels/${hostelId}/publish`, {}, {
      token,
      signal,
    })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to publish hostel')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Hostel is now visible on the public list',
    }
  },

  /**
   * POST /api/hostels/:hostelId/rooms/:roomId/request
   */
  async requestRoom(hostelId, roomId, payload = {}, { token, signal } = {}) {
    const response = await apiPostRaw(
      `/hostels/${hostelId}/rooms/${roomId}/request`,
      payload,
      {
        token,
        signal,
      },
    )

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to send room request')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Request sent successfully',
    }
  },

  /**
   * GET /api/hostels/room-requests/inbox
   */
  async listRoomRequestsInbox({ token, signal } = {}) {
    const response = await apiGet('/hostels/room-requests/inbox', { token, signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load requests inbox')
      error.payload = response
      throw error
    }

    const rows = Array.isArray(response.data) ? response.data : []
    return {
      success: true,
      data: rows.map(mapRoomRequestFromApi),
      message: response?.message || 'Requests inbox loaded',
    }
  },

  /**
   * PATCH /api/hostels/room-requests/respond
   */
  async respondRoomRequest(payload = {}, { token, signal } = {}) {
    const response = await apiPatchRaw('/hostels/room-requests/respond', payload, {
      token,
      signal,
    })

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to respond to request')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response?.data ?? null,
      message: response?.message || 'Request response submitted',
    }
  },

  /**
   * POST /api/hostels/:hostelId/call-click
   */
  async trackCallClick(hostelId, { token, signal } = {}) {
    const response = await apiPostRaw(
      `/hostels/${hostelId}/call-click`,
      {},
      {
        token,
        signal,
      },
    )

    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to track call click')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Call click tracked',
    }
  },

  /**
   * GET /api/hostels/owner/dashboard-analytics
   */
  async getOwnerDashboardAnalytics({ token, signal } = {}) {
    const response = await apiGet('/hostels/owner/dashboard-analytics', { token, signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load dashboard analytics')
      error.payload = response
      throw error
    }

    return {
      success: true,
      data: response?.data ?? {},
      message: response?.message ?? 'Dashboard analytics loaded',
    }
  },
})
