import { apiGet, apiPostRaw, apiRequest } from '../../shared/apiConfig'

const normalizeHostel = (raw) => ({
  id: raw?._id ?? raw?.id ?? raw?.itemId ?? '',
  name: raw?.name ?? raw?.hostelName ?? 'Untitled hostel',
  address: {
    city: raw?.address?.city ?? raw?.hostelAddress?.city ?? '',
    area: raw?.address?.area ?? raw?.hostelAddress?.area ?? '',
  },
  ratingAverage: typeof raw?.ratingAverage === 'number' ? raw.ratingAverage : Number(raw?.ratingAverage) || 0,
  images: Array.isArray(raw?.images) ? raw.images : [],
})

export const createSavedApiRepository = () => ({
  async saveItem(itemType, itemId, { signal } = {}) {
    const response = await apiPostRaw('/saved', { itemType, itemId }, { signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to save item')
      error.payload = response
      throw error
    }
    return { success: true, data: response?.data ?? null }
  },

  async removeSavedItem(itemType, itemId, { signal } = {}) {
    const response = await apiRequest('/saved', {
      method: 'DELETE',
      body: { itemType, itemId },
      signal,
    })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to remove saved item')
      error.payload = response
      throw error
    }
    return { success: true, data: response?.data ?? null }
  },

  async fetchSavedItems({ signal } = {}) {
    const response = await apiGet('/saved', { signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to fetch saved items')
      error.payload = response
      throw error
    }

    const hostels = Array.isArray(response?.data?.hostels)
      ? response.data.hostels.map(normalizeHostel).filter((item) => item.id)
      : []
    const beds = Array.isArray(response?.data?.beds) ? response.data.beds : []

    return {
      success: true,
      data: { hostels, beds },
    }
  },
})