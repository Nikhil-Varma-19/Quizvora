import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { readAuth, readGuest } from "./auth";

const SOCKET_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN_SOCKET as string | undefined) ||
  "http://localhost:7000";

export interface SocketAck<T> {
  success: boolean;
  message: string;
  data: T | null;
}

let socket: Socket | null = null;
let binder: ((s: Socket) => void) | null = null;

// The backend identifies a connection by userId (registered) or sessionId (guest).
function buildAuthPayload(): Record<string, string> {
  const user = readAuth();
  if (user) return { userId: user.userId };
  const guest = readGuest();
  if (guest) return { sessionId: guest.sessionId };
  return {};
}

/**
 * Registers the function that attaches server -> client listeners. It runs
 * for the current socket and for every socket created after a reset, so
 * listeners are in place before any event (e.g. a replayed `question:show`
 * right after `room:join`) can arrive.
 */
export function setSocketBinder(fn: ((s: Socket) => void) | null): void {
  binder = fn;
  if (fn && socket) fn(socket);
}

export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(SOCKET_ORIGIN, {
    autoConnect: false,
    auth: buildAuthPayload(),
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
  binder?.(socket);
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected && !s.active) s.connect();
  return s;
}

/** Connects and resolves once the handshake completes. */
export function ensureConnected(timeoutMs = 8000): Promise<Socket> {
  const s = getSocket();
  if (s.connected) return Promise.resolve(s);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Could not connect to the server. Please try again."));
    }, timeoutMs);

    function onConnect() {
      cleanup();
      resolve(s);
    }
    function onError(err: Error) {
      cleanup();
      s.disconnect();
      reject(err);
    }
    function cleanup() {
      clearTimeout(timer);
      s.off("connect", onConnect);
      s.off("connect_error", onError);
    }

    s.on("connect", onConnect);
    s.on("connect_error", onError);
    s.connect();
  });
}

/** Drops the socket so the next connect rebuilds auth for the current identity. */
export function resetSocket(): void {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
  }
  socket = null;
}

/** Promise wrapper for the backend's `{ success, message, data }` ack callbacks. */
export function emitWithAck<TReq extends object, TData>(
  event: string,
  payload: TReq,
  timeoutMs = 10000,
): Promise<SocketAck<TData>> {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    if (!s.connected) {
      reject(new Error("Not connected to the server. Please try again."));
      return;
    }
    s.timeout(timeoutMs).emit(
      event,
      payload,
      (err: Error | null, response: SocketAck<TData>) => {
        if (err) {
          reject(new Error("The server did not respond in time. Please try again."));
          return;
        }
        resolve(response);
      },
    );
  });
}
