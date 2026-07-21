import type { ModePlay, ResultMode, UserType } from '../types'

// Single source of truth for the persisted identity, shared by the axios
// interceptor and the socket client so both can read it without importing
// the zustand store module (avoids an import cycle with lib/api.ts, which
// the store itself calls into for login/register/guest-create requests).

export const AUTH_STORAGE_KEY = 'quizvora:auth'

export interface PersistedAuth {
  type: UserType | null
  name: string | null
  email: string | null
  token: string | null
  userId: string | null
  sessionId: string | null
}

export const emptyAuth: PersistedAuth = {
  type: null,
  name: null,
  email: null,
  token: null,
  userId: null,
  sessionId: null,
}

export function readPersistedAuth(): PersistedAuth {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return emptyAuth
    const parsed = JSON.parse(raw)
    return { ...emptyAuth, ...parsed }
  } catch {
    return emptyAuth
  }
}

export function writePersistedAuth(auth: PersistedAuth): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearPersistedAuth(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

// Active room hint
// The backend auto-rejoins a reconnecting identity to its active room and
// replays `quiz:started` / `question:show`, but those events don't carry
// enough (no `mode`, `title`, `isHost`) to fully reconstruct the screen the
// player was on before a hard refresh - the in-memory game store is empty
// again after a reload. This small hint, written whenever a room is
// created/joined and cleared on leave/reset, lets the app resume to the
// right screen and then let the real-time events correct the rest.

export const ROOM_STORAGE_KEY = 'quizvora:active-room'

export interface PersistedRoom {
  roomId: string
  code: string
  // A joining participant's `room:join` ack carries none of these - only
  // the host (who just submitted `room:create`) knows them.
  title: string | null
  mode: ModePlay | null
  resultMode: ResultMode | null
  isHost: boolean
}

export function readPersistedRoom(): PersistedRoom | null {
  try {
    const raw = sessionStorage.getItem(ROOM_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedRoom
  } catch {
    return null
  }
}

export function writePersistedRoom(room: PersistedRoom): void {
  sessionStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(room))
}

export function clearPersistedRoom(): void {
  sessionStorage.removeItem(ROOM_STORAGE_KEY)
}
