/**
 * Maps chat REST failures (axios + API envelope) to user-visible copy.
 */
export const formatChatHistoryError = (err) => {
  const status = err?.status
  const payload = err?.payload ?? {}
  const nested = payload?.error ?? {}
  const apiMsg =
    (typeof nested?.message === 'string' && nested.message) ||
    (typeof payload?.message === 'string' && payload.message) ||
    ''

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Network error — check your connection and try again.'
  }

  const code = nested?.code ?? payload?.code
  if (code && typeof code === 'string') {
    const lower = `${apiMsg}`.trim()
    return lower || `Could not load chat (${code}).`
  }

  if (status === 401) {
    return apiMsg || 'Please sign in again to load messages.'
  }
  if (status === 403) {
    return apiMsg || 'You do not have access to this conversation.'
  }
  if (status === 404) {
    return apiMsg || 'Chat was not found for this hostel.'
  }

  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return 'Network error — could not reach the server.'
  }

  return apiMsg || err?.message || 'Failed to load messages.'
}

export const formatChatAckError = (ack) => {
  if (!ack || typeof ack !== 'object') return 'Unexpected server response.'
  const nested = ack?.error ?? {}
  return (
    (typeof ack.message === 'string' && ack.message) ||
    (typeof nested.message === 'string' && nested.message) ||
    'Request failed.'
  )
}
