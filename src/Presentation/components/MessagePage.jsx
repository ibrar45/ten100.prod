import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { MessageCircle, Search, SendHorizontal } from 'lucide-react'
import { API_ORIGIN, SOCKET_IO_ORIGIN } from '../../shared/apiConfig'

function normalizeUserId(user) {
  if (!user || typeof user !== 'object') return null
  const raw = user.id ?? user._id
  if (raw == null) return null
  return String(raw)
}

function normalizeEntityId(value) {
  if (value == null || value === '') return null
  return String(value)
}

/** Map GET /api/hostels/owner/chat/conversations → row shape for this UI */
function mapOwnerConversationFromApi(api) {
  const updated = api.updatedAt || api.lastMessage?.createdAt
  return {
    id: api.id,
    hostelId: api.hostelId,
    peerId: api.peerId,
    tenantId: api.peerId,
    tenantLabel: api.peerDisplayName || api.peerUsername || 'Tenant',
    hostelLabel: api.hostelName || '',
    preview: api.preview || 'Tap to open chat',
    timeLabel: formatListTime(updated),
  }
}

function formatListTime(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

/** Resolve thread IDs from a conversation row (supports peerId or tenantId from API). */
function idsFromConversation(c) {
  if (!c || typeof c !== 'object') return { hostelId: null, peerId: null }
  const hostelId = normalizeEntityId(c.hostelId ?? c.hostel_id)
  const peerId = normalizeEntityId(
    c.peerId ?? c.tenantId ?? c.tenant_id ?? c.userId ?? c.user_id,
  )
  return { hostelId, peerId }
}

/**
 * Owner messages (only).
 *
 * **Inbox from API (default):** omit `conversations` → loads
 * `GET /api/hostels/owner/chat/conversations` after session is ready.
 *
 * **Manual inbox:** pass `conversations={[...]}` (same row shape as mapped API rows).
 *
 * **Single thread, no list:** `conversations={[]}` or omit list + pass `hostelId` + `peerId`.
 *
 * Optional `apiOrigin` overrides the default (same host as `API_BASE_URL` in `apiConfig`).
 */
export default function MessagePage({
  apiOrigin = '',
  conversations: conversationsFromParent,
  socketAuthToken = null,
  hostelId: hostelIdProp = null,
  peerId: peerIdProp = null,
}) {
  const useApiInbox = conversationsFromParent === undefined

  const [currentUserId, setCurrentUserId] = useState(null)
  const [meLoading, setMeLoading] = useState(true)
  const [meError, setMeError] = useState(null)

  const [apiConversations, setApiConversations] = useState([])
  const [inboxLoading, setInboxLoading] = useState(false)
  const [inboxError, setInboxError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const socketRef = useRef(null)
  const activeThreadRef = useRef(null)

  const apiPrefix = useMemo(() => {
    const trimmed = typeof apiOrigin === 'string' ? apiOrigin.trim().replace(/\/$/, '') : ''
    return trimmed || API_ORIGIN
  }, [apiOrigin])

  const socketUrl = useMemo(() => {
    const trimmed = typeof apiOrigin === 'string' ? apiOrigin.trim().replace(/\/$/, '') : ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        return new URL(trimmed).origin
      } catch {
        return SOCKET_IO_ORIGIN
      }
    }
    return SOCKET_IO_ORIGIN
  }, [apiOrigin])

  const conversations = useMemo(() => {
    if (useApiInbox) return apiConversations
    return Array.isArray(conversationsFromParent) ? conversationsFromParent : []
  }, [useApiInbox, apiConversations, conversationsFromParent])

  useEffect(() => {
    let cancelled = false

    async function loadMe() {
      setMeLoading(true)
      setMeError(null)

      try {
        const url = `${apiPrefix}/api/auth/me`
        const res = await fetch(url, { credentials: 'include' })
        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message ?? json.error?.code ?? 'Not signed in')
        }

        const id = normalizeUserId(json.data)
        if (!id) throw new Error('Invalid user payload from /api/auth/me')

        if (!cancelled) setCurrentUserId(id)
      } catch (e) {
        if (!cancelled) {
          setCurrentUserId(null)
          setMeError(e instanceof Error ? e.message : 'Failed to load session')
        }
      } finally {
        if (!cancelled) setMeLoading(false)
      }
    }

    void loadMe()
    return () => {
      cancelled = true
    }
  }, [apiPrefix])

  useEffect(() => {
    if (!useApiInbox || !currentUserId) return

    let cancelled = false

    async function loadOwnerInbox() {
      setInboxLoading(true)
      setInboxError(null)
      try {
        const url = `${apiPrefix}/api/hostels/owner/chat/conversations`
        const res = await fetch(url, { credentials: 'include' })
        const json = await res.json()
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message ?? json.error?.code ?? 'Failed to load conversations')
        }
        const rows = Array.isArray(json.data) ? json.data : []
        if (!cancelled) setApiConversations(rows.map(mapOwnerConversationFromApi))
      } catch (e) {
        if (!cancelled) {
          setApiConversations([])
          setInboxError(e instanceof Error ? e.message : 'Failed to load conversations')
        }
      } finally {
        if (!cancelled) setInboxLoading(false)
      }
    }

    void loadOwnerInbox()
    return () => {
      cancelled = true
    }
  }, [useApiInbox, currentUserId, apiPrefix])

  useEffect(() => {
    if (!conversations.length) {
      setSelectedId(null)
      return
    }
    setSelectedId((prev) => {
      if (prev != null && conversations.some((c) => c.id === prev)) return prev
      return conversations[0].id
    })
  }, [conversations])

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  const standaloneHostelId = normalizeEntityId(hostelIdProp)
  const standalonePeerId = normalizeEntityId(peerIdProp)
  const hasConversationList = conversations.length > 0

  const { hostelId, peerId } = useMemo(() => {
    if (hasConversationList && selected) {
      return idsFromConversation(selected)
    }
    if (!hasConversationList && standaloneHostelId && standalonePeerId) {
      return { hostelId: standaloneHostelId, peerId: standalonePeerId }
    }
    return { hostelId: null, peerId: null }
  }, [hasConversationList, selected, standaloneHostelId, standalonePeerId])

  useEffect(() => {
    activeThreadRef.current = hostelId && peerId ? { hostelId, peerId } : null
  }, [hostelId, peerId])

  const fetchHistory = useCallback(async () => {
    if (!hostelId || !peerId) {
      setMessages([])
      return
    }
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const url = `${apiPrefix}/api/hostels/${hostelId}/chat?peerId=${encodeURIComponent(peerId)}`
      const res = await fetch(url, { credentials: 'include' })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error?.message ?? json.error?.code ?? 'Failed to load chat')
      }
      setMessages(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      setMessages([])
      setHistoryError(e instanceof Error ? e.message : 'Failed to load chat')
    } finally {
      setHistoryLoading(false)
    }
  }, [apiPrefix, hostelId, peerId])

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    if (!currentUserId) return

    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      withCredentials: true,
      ...(socketAuthToken ? { auth: { token: socketAuthToken } } : {}),
    })

    socketRef.current = socket

    const onIncoming = (msg) => {
      const th = activeThreadRef.current
      if (!th) return
      if (String(msg.hostel) !== th.hostelId) return
      const a = String(msg.from)
      const b = String(msg.to)
      const me = currentUserId
      const peer = th.peerId
      const isThisThread =
        (a === me && b === peer) || (a === peer && b === me)
      if (!isThisThread) return

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    }

    socket.on('hostel_chat_message', onIncoming)

    return () => {
      socket.off('hostel_chat_message', onIncoming)
      socket.disconnect()
      socketRef.current = null
    }
  }, [socketUrl, currentUserId, socketAuthToken])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !hostelId || !peerId) return

    const join = () => {
      socket.emit('join_hostel_chat', { hostelId, peerId }, (ack) => {
        if (ack && ack.success === false && import.meta.env.DEV) {
          console.warn('[chat] join_hostel_chat:', ack.message)
        }
      })
    }

    join()
    socket.on('connect', join)

    return () => {
      socket.off('connect', join)
    }
  }, [hostelId, peerId])

  async function handleSend() {
    const text = draft.trim()
    if (!hostelId || !peerId || !text || sending) return

    setSending(true)
    const socket = socketRef.current
    try {
      if (!socket?.connected) {
        throw new Error('Not connected — check Socket proxy / auth')
      }
      await new Promise((resolve, reject) => {
        socket.emit(
          'send_hostel_chat_message',
          { hostelId, toUserId: peerId, body: text },
          (ack) => {
            if (ack?.success === false) reject(new Error(ack.message ?? 'Send failed'))
            else resolve()
          },
        )
      })
      setDraft('')
    } catch (e) {
      if (import.meta.env.DEV) console.error('[chat] send failed', e)
      alert(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  if (meLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        Loading session…
      </div>
    )
  }

  if (meError || !currentUserId) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        <p className="font-medium text-slate-800">Sign in required</p>
        <p className="mt-2 text-sm text-slate-500">{meError ?? 'Could not load your account.'}</p>
      </div>
    )
  }

  if (useApiInbox && inboxLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        Loading conversations…
      </div>
    )
  }

  if (useApiInbox && inboxError) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        <p className="font-medium text-slate-800">Could not load inbox</p>
        <p className="mt-2 text-sm text-slate-500">{inboxError}</p>
      </div>
    )
  }

  if (useApiInbox && !inboxLoading && !conversations.length && !(standaloneHostelId && standalonePeerId)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        <p className="font-medium text-slate-800">No conversations yet</p>
        <p className="mt-2 text-sm text-slate-500">
          When tenants message your hostels, threads will show here.
        </p>
      </div>
    )
  }

  if (!useApiInbox && !hasConversationList && !(standaloneHostelId && standalonePeerId)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        <p className="font-medium text-slate-800">No chat thread</p>
        <p className="mt-2 text-sm text-slate-500">
          Pass a <code className="rounded bg-slate-100 px-1">conversations</code> list, or set{' '}
          <code className="rounded bg-slate-100 px-1">hostelId</code> and{' '}
          <code className="rounded bg-slate-100 px-1">peerId</code> for a single thread.
        </p>
      </div>
    )
  }

  const threadReady = Boolean(hostelId && peerId)
  const rowIds = selected ? idsFromConversation(selected) : { hostelId: null, peerId: null }
  const rowMissingIds =
    hasConversationList &&
    Boolean(selected) &&
    (!rowIds.hostelId || !rowIds.peerId)
  const showThread = threadReady && (!hasConversationList || Boolean(selected))

  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.28)] lg:min-h-[calc(100vh-10rem)]">
      <div className="flex flex-1 overflow-hidden">
        {hasConversationList ? (
          <aside className="flex w-full max-w-full shrink-0 flex-col border-slate-100 bg-slate-50/80 sm:max-w-[320px] sm:border-r">
            <div className="border-b border-slate-100 bg-white px-4 py-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Messages</h2>
              <p className="mt-0.5 text-xs text-slate-500">Chats with tenants</p>
              <div className="relative mt-4">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search"
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none ring-sky-500/20 placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-2"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-2" aria-label="Conversations">
              {conversations.map((c, i) => (
                <ConversationRow
                  key={c.id}
                  selected={selectedId === c.id}
                  onSelect={() => setSelectedId(c.id)}
                  initials={initialsFromLabel(c.tenantLabel)}
                  nameLabel={c.tenantLabel}
                  subtitle={c.hostelLabel}
                  previewLabel={c.preview ?? 'Tap to open chat'}
                  timeLabel={c.timeLabel ?? ''}
                  accent={accentAt(i)}
                />
              ))}
            </nav>
          </aside>
        ) : null}

        <section className="flex min-h-[420px] min-w-0 flex-1 flex-col bg-[#eceff4]">
          {showThread ? (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-inner ${
                    hasConversationList && selected
                      ? accentForRow(conversations.findIndex((x) => x.id === selected.id))
                      : accentAt(0)
                  }`}
                >
                  {hasConversationList && selected
                    ? initialsFromLabel(selected.tenantLabel)
                    : 'CH'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {hasConversationList && selected ? selected.tenantLabel : 'Chat'}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {hasConversationList && selected
                      ? selected.hostelLabel || selected.hostelId || `Hostel ${hostelId}`
                      : `Hostel ${hostelId} · Peer ${peerId}`}
                  </p>
                </div>
                <MessageCircle className="text-slate-400" size={20} aria-hidden />
              </header>

              <div
                className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.12) 1px, transparent 0)',
                  backgroundSize: '18px 18px',
                }}
              >
                {historyLoading && (
                  <p className="text-center text-xs text-slate-500">Loading messages…</p>
                )}
                {historyError && (
                  <p className="text-center text-xs text-red-600">{historyError}</p>
                )}
                {!historyLoading &&
                  messages.map((m) => {
                    const mine = String(m.from) === String(currentUserId)
                    return (
                      <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                            mine
                              ? 'rounded-br-md border border-sky-100 bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                              : 'rounded-bl-md border border-white/90 bg-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                          <p
                            className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}
                          >
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                {!historyLoading && messages.length === 0 && !historyError && (
                  <p className="mt-auto pt-6 text-center text-xs font-medium text-slate-400">
                    No messages yet — say hello below.
                  </p>
                )}
              </div>

              <footer className="shrink-0 border-t border-slate-200 bg-white p-3">
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2 shadow-inner transition focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/15">
                  <label htmlFor="message-page-input" className="sr-only">
                    Reply
                  </label>
                  <textarea
                    id="message-page-input"
                    rows={1}
                    placeholder="Type a reply…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        void handleSend()
                      }
                    }}
                    className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    disabled={sending || !draft.trim()}
                    onClick={() => void handleSend()}
                    className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md transition hover:brightness-105 enabled:active:scale-95 disabled:opacity-40"
                    aria-label="Send reply"
                  >
                    <SendHorizontal size={18} strokeWidth={2} />
                  </button>
                </div>
              </footer>
            </>
          ) : rowMissingIds ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <MessageCircle className="text-amber-300" size={40} />
              <p className="text-sm font-semibold text-slate-800">This conversation has no thread IDs</p>
              <p className="max-w-md text-xs text-slate-500">
                Include <span className="font-mono text-slate-700">hostelId</span> (or{' '}
                <span className="font-mono text-slate-700">hostel_id</span>) and{' '}
                <span className="font-mono text-slate-700">peerId</span> (or{' '}
                <span className="font-mono text-slate-700">tenantId</span> /{' '}
                <span className="font-mono text-slate-700">userId</span>) on each conversation object.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
              <MessageCircle className="text-slate-300" size={40} />
              <p className="text-sm font-medium">Select a conversation</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ConversationRow({
  selected,
  onSelect,
  initials,
  nameLabel,
  subtitle,
  previewLabel,
  timeLabel,
  accent,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        selected ? 'bg-white shadow-md ring-1 ring-slate-200/80' : 'hover:bg-white/70 hover:shadow-sm'
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-inner ${accent}`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-semibold text-slate-900">{nameLabel}</span>
          <span className="shrink-0 text-[11px] font-medium text-slate-400">{timeLabel}</span>
        </div>
        {subtitle ? <p className="truncate text-xs text-slate-400">{subtitle}</p> : null}
        <p className="truncate text-sm text-slate-500">{previewLabel}</p>
      </div>
    </button>
  )
}

function initialsFromLabel(name) {
  const safe = String(name ?? '').trim()
  const parts = safe.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
  return 'TN'
}

const ACCENTS = ['bg-teal-600', 'bg-sky-600', 'bg-violet-600', 'bg-amber-600']
function accentAt(i) {
  return ACCENTS[i % ACCENTS.length]
}
function accentForRow(i) {
  return accentAt(Math.max(0, i))
}

function formatTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}