import { io } from 'socket.io-client'
import { SOCKET_IO_ORIGIN } from '../../shared/apiConfig'

/** Same logic as `SOCKET_IO_ORIGIN` in apiConfig (Railway when REST uses `/api` proxy). */
const getSocketBaseUrl = () => SOCKET_IO_ORIGIN

let socket = null

export const getSocket = () => {
  if (!socket) {
    const url = getSocketBaseUrl()
    socket = io(url, {
      path: '/socket.io',
      autoConnect: false,
      withCredentials: true,
      transports: ['polling', 'websocket'],
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
