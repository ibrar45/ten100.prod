import axios from 'axios'

/** Production API (absolute). In `vite` dev, use `/api` so the browser hits same origin → Vite proxy → backend (avoids CORS). */
const RAILWAY_API_BASE = 'https://ten100compkdeploy-production.up.railway.app/api'

const railwayOrigin = (() => {
  try {
    return new URL(RAILWAY_API_BASE).origin
  } catch {
    return 'https://ten100compkdeploy-production.up.railway.app'
  }
})()

export const API_BASE_URL = import.meta.env.DEV ? '/api' : RAILWAY_API_BASE

/** Origin for `fetch(.../api/...)` and Socket.IO when not using a relative `/api` base. */
export const API_ORIGIN =
  import.meta.env.DEV && typeof globalThis !== 'undefined' && globalThis.location?.origin
    ? globalThis.location.origin
    : railwayOrigin

const getApiOrigin = () => {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    try {
      return new URL(API_BASE_URL).origin
    } catch {
      return ''
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return ''
}

export const resolveApiAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const apiOrigin = getApiOrigin()
  if (!apiOrigin) return path.startsWith('/') ? path : `/${path}`

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiOrigin}${normalizedPath}`
}

export const buildApiBody = (data = {}, meta = {}) => ({
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
})

const buildHeaders = (token, customHeaders = {}, { isFormData = false } = {}) => {
  const headers = {
    ...customHeaders,
  }

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) headers.Authorization = `Bearer ${token}`

  return headers
}

export const apiRequest = async (
  endpoint,
  { method = 'GET', body, token, headers, signal } = {},
) => {
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData

  try {
    const response = await axios({
      url: `${API_BASE_URL}${endpoint}`,
      method,
      data: body,
      headers: buildHeaders(token, headers, { isFormData }),
      withCredentials: true,
      signal,
    })

    return response?.data ?? null
  } catch (axiosError) {
    const payload = axiosError?.response?.data ?? null
    const error = new Error(
      payload?.message ||
        payload?.error?.message ||
        axiosError?.message ||
        'API request failed',
    )
    error.status = axiosError?.response?.status
    error.payload = payload
    throw error
  }
}

export const apiGet = (endpoint, options = {}) =>
  apiRequest(endpoint, { ...options, method: 'GET' })

export const apiPost = (endpoint, data = {}, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: buildApiBody(data, options.meta),
  })

export const apiPostRaw = (endpoint, data = {}, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: data,
  })

export const apiPostForm = (endpoint, formData, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: formData,
  })

export const apiPatchRaw = (endpoint, data = {}, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: data,
  })

export const apiDelete = (endpoint, options = {}) =>
  apiRequest(endpoint, { ...options, method: 'DELETE' })

export default API_BASE_URL
