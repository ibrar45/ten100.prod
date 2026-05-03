import { io } from 'socket.io-client'
import { API_BASE_URL } from '../../shared/apiConfig'

/**
 * Socket.IO uses the API host origin (no `/api` suffix).
 * Override with VITE_SOCKET_URL if the socket is served from a different origin.
 */
const getSocketBaseUrl = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL
  if (envUrl && String(envUrl).trim()) {
    return String(envUrl).replace(/\/$/, '')
  }

  if (typeof API_BASE_URL === 'string' && API_BASE_URL.startsWith('http')) {
    try {
      return new URL(API_BASE_URL).origin
    } catch {
      return ''
    }
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

let socket = null

export const getSocket = () => {
  if (!socket) {
    const url = getSocketBaseUrl()
    socket = io(url, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
  }
  return s
}

/** Hard disconnect — use sparingly (e.g. logout). */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/** Register once per event name (useful for dev hot reload duplicates). */
export const subscribeSocketEvent = (eventName, handler) => {
  const s = getSocket()
  s.on(eventName, handler)
  return () => {
    s.off(eventName, handler)
  }
}
