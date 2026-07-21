import { create } from 'zustand'
import { clearPersistedAuth, readPersistedAuth, writePersistedAuth, type PersistedAuth } from '../lib/storage'
import { resetSocket } from '../lib/socket'
import type { UserType } from '../types'

interface AuthState extends PersistedAuth {
  isAuthenticated: boolean
  displayName: string
  setUserIdentity: (params: { token: string; userId: string; email: string; name?: string }) => void
  setGuestIdentity: (params: { sessionId: string; name: string }) => void
  logout: () => void
}

function deriveDisplayName(type: UserType | null, name: string | null, email: string | null): string {
  if (type === 'Guest') return name || 'Guest'
  if (type === 'User') return name || email || 'Host'
  return ''
}

const initial = readPersistedAuth()

export const useAuthStore = create<AuthState>((set) => ({
  ...initial,
  isAuthenticated: initial.type !== null,
  displayName: deriveDisplayName(initial.type, initial.name, initial.email),

  setUserIdentity: ({ token, userId, email, name }) => {
    const next: PersistedAuth = {
      type: 'User',
      token,
      userId,
      email,
      name: name ?? null,
      sessionId: null,
    }
    writePersistedAuth(next)
    resetSocket()
    set({
      ...next,
      isAuthenticated: true,
      displayName: deriveDisplayName(next.type, next.name, next.email),
    })
  },

  setGuestIdentity: ({ sessionId, name }) => {
    const next: PersistedAuth = {
      type: 'Guest',
      sessionId,
      name,
      token: null,
      userId: null,
      email: null,
    }
    writePersistedAuth(next)
    resetSocket()
    set({
      ...next,
      isAuthenticated: true,
      displayName: deriveDisplayName(next.type, next.name, next.email),
    })
  },

  logout: () => {
    clearPersistedAuth()
    resetSocket()
    set({
      type: null,
      name: null,
      email: null,
      token: null,
      userId: null,
      sessionId: null,
      isAuthenticated: false,
      displayName: '',
    })
  },
}))
