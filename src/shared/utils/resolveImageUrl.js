import { resolveApiAssetUrl } from '../apiConfig'

const PLACEHOLDER = '/src/assets/hero.png'

/**
 * Only allow local assets and backend uploads.
 * External 3rd-party URLs intentionally resolve to placeholder.
 */
export const resolveImageUrl = (path) => {
  if (!path) return PLACEHOLDER
  const value = String(path).trim()
  if (!value) return PLACEHOLDER

  if (value.startsWith('/src/') || value.startsWith('/assets/')) return value
  if (value.startsWith('/uploads/')) return resolveApiAssetUrl(value)
  if (value.startsWith('uploads/')) return resolveApiAssetUrl(`/${value}`)

  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const url = new URL(value)
      if (url.pathname.startsWith('/uploads/')) return value
    } catch {
      return PLACEHOLDER
    }
    return PLACEHOLDER
  }

  return PLACEHOLDER
}
