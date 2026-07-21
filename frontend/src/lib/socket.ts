import { io, Socket } from 'socket.io-client'
import { readPersistedAuth } from './storage'
import type { SocketAck } from '../types'

// setup that fronts the API behind the same origin, this stays undefined and
// socket.io-client simply connects to `window.location.origin`.
const SOCKET_ORIGIN = (import.meta.env.VITE_API_ORIGIN_SOCKET as string | undefined) || undefined

let socket: Socket | null = null

function buildAuthPayload(): Record<string, string> {
  const auth = readPersistedAuth()

  if (auth.type === 'User' && auth.userId) {
    return { userId: auth.userId }
  }
  if (auth.type === 'Guest' && auth.sessionId) {
    return { sessionId: auth.sessionId }
  }
  return {}
}

/** Lazily creates (but does not connect) the singleton socket instance. */
export function getSocket(): Socket {
  if (socket) return socket

  socket = io(SOCKET_ORIGIN, {
    autoConnect: false,
    auth: buildAuthPayload(),
    // Bounded retry: the backend explicitly rejects a reconnect attempt if
    // the same identity still has a live connection registered in Redis, so
    // we must not hammer it forever - surface the failure instead.
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  return socket
}

/** Connects (or reconnects) the socket using whatever identity is currently persisted. */
export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

/**
 * Connects if necessary and resolves once the handshake actually completes,
 * so callers that need to emit right away (e.g. "join room" right after
 * guest signup) don't race the initial connection.
 */
export function ensureConnected(timeoutMs = 8000): Promise<Socket> {
  const s = getSocket()
  if (s.connected) return Promise.resolve(s)

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('Could not connect to the server. Please try again.'))
    }, timeoutMs)

    function onConnect() {
      cleanup()
      resolve(s)
    }

    function onError(err: Error) {
      console.log("Erooor",err)
      cleanup()
      reject(err)
    }
    
    function cleanup() {
      clearTimeout(timer)
      s.off('connect', onConnect)
      s.off('connect_error', onError)
    }

    s.on('connect', onConnect)
    s.on('connect_error', onError)
    s.connect()
  })
}

export function disconnectSocket(): void {
  socket?.disconnect()
}

/**
 * Tears down the current socket entirely so the next connectSocket() call
 * rebuilds the `auth` payload from scratch. Call this right after login,
 * register, guest-create, or logout - the identity used at connect time
 * would otherwise be stale.
 */
export function resetSocket(): void {
  if (socket) {
    socket.disconnect()
    socket.removeAllListeners()
  }
  socket = null
}

/**
 * Wraps a callback-ack socket emit in a Promise. The backend's ack callback
 * shape is always `{ success, message, data }`, delivered as a single
 * argument (no error-first convention) - `.timeout()` only prepends a
 * client-side timeout error, it doesn't change what the server sends.
 */
export function emitWithAck<TReq extends object, TData>(
  event: string,
  payload: TReq,
  timeoutMs = 10000,
): Promise<SocketAck<TData>> {
  return new Promise((resolve, reject) => {
    const s = getSocket()
    if (!s.connected) {
      reject(new Error('Not connected to the server. Please check your connection and try again.'))
      return
    }

    s.timeout(timeoutMs).emit(event, payload, (err: Error | null, response: SocketAck<TData>) => {
      if (err) {
        reject(new Error('The server did not respond in time. Please try again.'))
        return
      }
      resolve(response)
    })
  })
}
