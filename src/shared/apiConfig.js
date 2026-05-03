import axios from 'axios'

/** Fallback origin when `API_BASE_URL` is absolute or `location` is unavailable. */
const RAILWAY_API_ORIGIN = 'https://ten100compkdeploy-production.up.railway.app'

/**
 * Default: same-origin `/api` (Vite dev proxy + Vercel rewrites → Railway). No browser CORS to Railway.
 * Set `VITE_API_BASE_URL` to a full URL only if you call the API directly and CORS is configured there.
 */
const explicitApiBase =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '')
    : ''

export const API_BASE_URL = explicitApiBase !== '' ? explicitApiBase : '/api'

/** HTTP origin for `fetch`, Socket.IO, and `${origin}/api/...` when using relative `/api`. */
export const API_ORIGIN = (() => {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    try {
      return new URL(API_BASE_URL).origin
    } catch {
      return RAILWAY_API_ORIGIN
    }
  }
  if (typeof globalThis !== 'undefined' && globalThis.location?.origin) {
    return globalThis.location.origin
  }
  return RAILWAY_API_ORIGIN
})()

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

  return RAILWAY_API_ORIGIN
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

    const data = response?.data ?? null
    const contentType = String(response?.headers?.['content-type'] ?? '')
    if (
      typeof data === 'string' &&
      (/^\s*</.test(data) || contentType.includes('text/html'))
    ) {
      const err = new Error(
        'Server returned HTML instead of JSON. On Vercel, /api must rewrite to your backend (vercel.json); redeploy after changing it.',
      )
      err.status = response?.status
      throw err
    }

    return data
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
