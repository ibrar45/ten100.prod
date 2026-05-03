/** Mongo ObjectId as 24 lowercase hex (case-insensitive). */
export const MONGO_OBJECT_ID_HEX = /^[a-f\d]{24}$/i

/** Server-side max length for chat body (trimmed). */
export const MAX_CHAT_MESSAGE_BODY_LEN = 4000

export const isMongoObjectId = (value) =>
  typeof value === 'string' && MONGO_OBJECT_ID_HEX.test(value.trim())

/**
 * Normalizes populated Mongo ids (string | { _id }) to a stable string.
 */
export const asEntityId = (value) => {
  if (value == null || value === '') return ''
  if (typeof value === 'object') return String(value._id ?? value.id ?? '')
  return String(value)
}

/**
 * Normalizes API / socket payloads into a stable chat message shape.
 */
export const normalizeMessage = (message) => ({
  id: String(message?._id ?? message?.id ?? ''),
  hostelId: String(
    message?.hostel?._id ?? message?.hostel ?? message?.hostelId ?? '',
  ),
  from: asEntityId(message?.from),
  to: asEntityId(message?.to),
  body: String(message?.body ?? ''),
  createdAt:
    message?.createdAt != null
      ? String(message.createdAt)
      : new Date().toISOString(),
  pending: Boolean(message?.pending),
})

/** @deprecated Use normalizeMessage — alias kept for incremental migration */
export const formatMessage = normalizeMessage

export const isOwnMessage = (message, currentUserId) => {
  if (!currentUserId || !message?.from) return false
  return String(message.from) === String(currentUserId)
}

/** True if message belongs to the DM thread currentUser ↔ peer for this hostel. */
export const isMessageInHostelPeerThread = (message, hostelId, peerId, currentUserId) => {
  const hid = String(message?.hostelId ?? '').trim()
  if (!hid || hid !== String(hostelId ?? '').trim()) return false
  const p = String(peerId ?? '').trim()
  const c = String(currentUserId ?? '').trim()
  if (!p || !c) return false
  const mf = String(message?.from ?? '').trim()
  const mt = String(message?.to ?? '').trim()
  return (mf === p && mt === c) || (mf === c && mt === p)
}

/**
 * Maps optional GET /hostels/:hostelId/chat/conversations rows into UI threads.
 */
export const mapConversationSummaryFromApi = (row, hostelId, hostelName) => {
  const peerRaw = row?.peer ?? row?.user ?? row?.tenant ?? {}
  const peerId = String(
    row?.peerId ?? peerRaw?._id ?? peerRaw?.id ?? row?.userId ?? '',
  ).trim()
  const peerName =
    `${typeof row?.peerName === 'string' ? row.peerName : ''}`.trim() ||
    [peerRaw?.profile?.firstName, peerRaw?.profile?.lastName].filter(Boolean).join(' ').trim() ||
    `${peerRaw?.username ?? ''}`.trim() ||
    `${peerRaw?.email ?? ''}`.trim() ||
    'Guest'

  const lastMessage =
    `${row?.lastMessage ?? row?.preview ?? row?.body ?? ''}`.trim()
  const lastMessageAt =
    row?.lastMessageAt ??
    row?.updatedAt ??
    row?.createdAt ??
    row?.timestamp ??
    ''

  return {
    peerId,
    peerName,
    hostelId: String(hostelId ?? ''),
    hostelName: `${hostelName ?? ''}`.trim(),
    lastMessage,
    lastMessageAt,
  }
}

export const sortMessagesOldestFirst = (messages) =>
  [...messages].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
