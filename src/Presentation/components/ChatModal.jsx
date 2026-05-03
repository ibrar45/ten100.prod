import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { MessageCircle, SendHorizontal, X } from 'lucide-react'
import { API_ORIGIN } from '../../shared/apiConfig'

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

/** Normalize Mongoose doc or plain object from REST / socket ack */
function normalizeChatMessage(doc) {
  if (!doc) return null
  const id = doc._id ?? doc.id
  if (id == null) return null
  const created = doc.createdAt
  return {
    _id: String(id),
    hostel: String(doc.hostel?._id ?? doc.hostel ?? ''),
    from: String(doc.from?._id ?? doc.from ?? ''),
    to: String(doc.to?._id ?? doc.to ?? ''),
    body: String(doc.body ?? ''),
    createdAt:
      created instanceof Date ? created.toISOString() : created != null ? String(created) : '',
  }
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

/**
 * Tenant / user floating chat with this hostel’s owner.
 */
export default function ChatModal({
  open,
  onClose,
  ownerName = 'Host',
  hostelId,
  ownerId,
  apiOrigin = '',
  socketAuthToken = null,
}) {
  const panelRef = useRef(null)
  const listEndRef = useRef(null)
  const socketRef = useRef(null)
  const activeThreadRef = useRef(null)

  const [currentUserId, setCurrentUserId] = useState(null)
  const [meLoading, setMeLoading] = useState(false)
  const [meError, setMeError] = useState(null)

  const [messages, setMessages] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const baseUrl = useMemo(() => {
    const trimmed = typeof apiOrigin === 'string' ? apiOrigin.trim().replace(/\/$/, '') : ''
    return trimmed || API_ORIGIN
  }, [apiOrigin])
  const apiPrefix = baseUrl

  const hid = normalizeEntityId(hostelId)
  const oid = normalizeEntityId(ownerId)

  const displayName =
    typeof ownerName === 'string' && ownerName.trim() ? ownerName.trim() : 'Host'

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    async function loadMe() {
      setMeLoading(true)
      setMeError(null)
      try {
        const res = await fetch(`${apiPrefix}/api/auth/me`, { credentials: 'include' })
        const json = await res.json()
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message ?? json.error?.code ?? 'Not signed in')
        }
        const id = normalizeUserId(json.data)
        if (!id) throw new Error('Invalid user from /api/auth/me')
        if (!cancelled) setCurrentUserId(id)
      } catch (e) {
        if (!cancelled) {
          setCurrentUserId(null)
          setMeError(e instanceof Error ? e.message : 'Session error')
        }
      } finally {
        if (!cancelled) setMeLoading(false)
      }
    }
    void loadMe()
    return () => {
      cancelled = true
    }
  }, [open, apiPrefix])

  useEffect(() => {
    activeThreadRef.current = hid && oid ? { hostelId: hid, peerId: oid } : null
  }, [hid, oid])

  const fetchHistory = useCallback(async () => {
    if (!open || !hid || !oid) {
      setMessages([])
      return
    }
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const url = `${apiPrefix}/api/hostels/${hid}/chat?peerId=${encodeURIComponent(oid)}`
      const res = await fetch(url, { credentials: 'include' })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error?.message ?? json.error?.code ?? 'Failed to load chat')
      }
      const rows = Array.isArray(json.data) ? json.data : []
      setMessages(rows.map((m) => normalizeChatMessage(m)).filter(Boolean))
    } catch (e) {
      setMessages([])
      setHistoryError(e instanceof Error ? e.message : 'Failed to load chat')
    } finally {
      setHistoryLoading(false)
    }
  }, [open, apiPrefix, hid, oid])

  useEffect(() => {
    if (!open) {
      setMessages([])
      setHistoryError(null)
      setDraft('')
      return
    }
    void fetchHistory()
  }, [open, fetchHistory])

  /** Single effect: socket + join when session + thread ids exist (fixes join-after-me race). */
  useEffect(() => {
    if (!open || !currentUserId || !hid || !oid) return

    const socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
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
      if (!((a === me && b === peer) || (a === peer && b === me))) return

      const row = normalizeChatMessage(msg)
      if (!row) return

      setMessages((prev) => {
        if (prev.some((m) => m._id === row._id)) return prev
        return [...prev, row]
      })
    }

    const join = () => {
      socket.emit('join_hostel_chat', { hostelId: hid, peerId: oid }, (ack) => {
        if (ack && ack.success === false && import.meta.env.DEV) {
          console.warn('[chat] join_hostel_chat:', ack.message)
        }
      })
    }

    socket.on('hostel_chat_message', onIncoming)
    socket.on('connect', join)
    if (socket.connected) join()

    return () => {
      socket.off('hostel_chat_message', onIncoming)
      socket.off('connect', join)
      socket.disconnect()
      socketRef.current = null
    }
  }, [open, baseUrl, currentUserId, socketAuthToken, hid, oid])

  useEffect(() => {
    if (!open) return
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [open, messages])

  function appendMessageDeduped(row) {
    if (!row) return
    setMessages((prev) => {
      if (prev.some((m) => m._id === row._id)) return prev
      return [...prev, row]
    })
  }

  async function handleSend() {
    const text = draft.trim()
    if (!hid || !oid || !text || sending || !currentUserId) return

    setSending(true)
    const socket = socketRef.current
    try {
      if (!socket?.connected) {
        throw new Error('Not connected — check Socket proxy / auth')
      }
      const ack = await new Promise((resolve, reject) => {
        socket.emit(
          'send_hostel_chat_message',
          { hostelId: hid, toUserId: oid, body: text },
          (cbAck) => {
            if (!cbAck || cbAck.success === false) {
              reject(new Error(cbAck?.message ?? 'Send failed'))
            } else resolve(cbAck)
          },
        )
      })
      setDraft('')
      /** Server returns saved doc — show immediately even if broadcast is delayed */
      const row = normalizeChatMessage(ack?.data)
      appendMessageDeduped(row)
    } catch (e) {
      if (import.meta.env.DEV) console.error('[chat] send failed', e)
      alert(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  const configError =
    open && (!hid || !oid) ? `Chat needs hostelId and ownerId (hostel owner user id).` : null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-end p-4 sm:p-6 transition-[opacity,visibility] duration-300 ease-out ${
        open ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-label="Close chat overlay"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
        className={`relative flex h-[min(560px,calc(100vh-8rem))] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-12px_rgba(15,23,42,0.35)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-8 scale-[0.96] opacity-0'
        }`}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 text-white">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/20">
            <MessageCircle size={20} className="text-white/95" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="chat-modal-title" className="truncate text-[15px] font-semibold tracking-tight">
              {displayName}
            </h2>
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-300/95">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Host
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/90 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div
          className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#eceff4] px-3 py-4"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.12) 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        >
          {configError ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">{configError}</p>
          ) : null}

          {meLoading ? (
            <p className="text-center text-xs text-slate-500">Checking session…</p>
          ) : null}
          {meError ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-800">{meError}</p>
          ) : null}

          {historyLoading ? (
            <p className="text-center text-xs text-slate-500">Loading messages…</p>
          ) : null}
          {historyError ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-800">{historyError}</p>
          ) : null}

          {!historyLoading &&
            !configError &&
            messages.map((m) => {
              const mine = currentUserId && String(m.from) === String(currentUserId)
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      mine
                        ? 'rounded-br-md border border-sky-100 bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                        : 'rounded-bl-md border border-white/80 bg-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                    <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}

          {!historyLoading && !historyError && !configError && messages.length === 0 && currentUserId && (
            <p className="mt-auto pt-4 text-center text-xs font-medium text-slate-400">
              No messages yet — say hello below.
            </p>
          )}

          <div ref={listEndRef} />
        </div>

        <footer className="shrink-0 border-t border-slate-100 bg-white p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2 shadow-inner transition focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/15">
            <label htmlFor="chat-modal-input" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-modal-input"
              rows={1}
              placeholder={
                !currentUserId || meError ? 'Sign in to message' : 'Type a message…'
              }
              disabled={!currentUserId || !!meError || !!configError || sending}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:opacity-50"
            />
            <button
              type="button"
              disabled={!currentUserId || !!meError || !!configError || sending || !draft.trim()}
              onClick={() => void handleSend()}
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md transition hover:brightness-105 enabled:active:scale-95 disabled:opacity-40"
              aria-label="Send"
            >
              <SendHorizontal size={18} strokeWidth={2} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}