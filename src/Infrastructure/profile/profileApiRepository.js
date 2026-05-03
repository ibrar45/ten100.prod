import { apiGet, apiPatchRaw } from '../../shared/apiConfig'
import { mapProfileFromApi } from '../../domain/profile/profileMappers'

export const createProfileApiRepository = () => ({
  async getMe({ signal } = {}) {
    const response = await apiGet('/profile/me', { signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to load profile')
      error.payload = response
      throw error
    }
    return { success: true, data: mapProfileFromApi(response.data) }
  },

  async updateMe(body, { signal } = {}) {
    const response = await apiPatchRaw('/profile/me', body, { signal })
    if (!response?.success) {
      const error = new Error(response?.message || 'Failed to update profile')
      error.payload = response
      throw error
    }
  },
})
