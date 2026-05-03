import { apiDelete, apiGet, apiPatchRaw, apiPostRaw } from '../../shared/apiConfig'
import { mapUserResponse } from '../../domain/auth/authMappers'

export const createAuthApiRepository = () => ({
  async register({ username, email, password }) {
    const response = await apiPostRaw('/auth/register', {
      username,
      email,
      password,
    })

    return {
      message: response?.message ?? 'User registered successfully',
      user: mapUserResponse(response?.data),
    }
  },

  async login({ identifier, password }) {
    const response = await apiPostRaw('/auth/login', {
      identifier,
      password,
    })

    return {
      message: response?.message ?? 'Login successful',
      user: mapUserResponse(response?.data),
    }
  },

  async me() {
    const response = await apiGet('/auth/me')
    return {
      user: mapUserResponse(response?.data),
      raw: response?.data ?? null,
    }
  },

  async logout() {
    const response = await apiPostRaw('/auth/logout', {})
    return {
      message: response?.message ?? 'Logout successful',
    }
  },

  async changePassword({ currentPassword, newPassword }) {
    const response = await apiPatchRaw('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return {
      message: response?.message ?? 'Password updated successfully',
    }
  },

  async deleteAccount() {
    const response = await apiDelete('/auth/me')
    return {
      message: response?.message ?? 'Account deleted',
      raw: response,
    }
  },
})
