import axios from 'axios'
import { readPersistedAuth } from './storage'
import type {
  ApiSuccess,
  BulkQuestionCreatePayload,
  GuestCreatePayload,
  GuestCreateResponseData,
  LoginPayload,
  LoginResponseData,
  Question,
  QuestionInput,
  RegisterPayload,
  RegisterResponseData,
  RoomCreatePayload,
  RoomCreateResponseData,
} from '../types'

// Relative path only - the Vite dev server proxies `/api` to the backend
// (see vite.config.ts). In production this is expected to be served from
// the same origin as the API, or fronted by a reverse proxy that does the
// same job the Vite proxy does in dev.
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

// The backend's auth is mutually exclusive and header-based: a registered
// user sends `Authorization: Bearer <jwt>`, a guest sends a lowercase
// `session-id: <sessionId>` header. Never send both - the backend checks
// Authorization first and would silently prefer it over session-id.
api.interceptors.request.use((config) => {
  const auth = readPersistedAuth()

  if (auth.type === 'User' && auth.token) {
    config.headers.set('Authorization', `Bearer ${auth.token}`)
  } else if (auth.type === 'Guest' && auth.sessionId) {
    config.headers.set('session-id', auth.sessionId)
  }

  return config
})

export interface ApiErrorShape {
  message: string
  error?: string
}

/** Pulls a human-readable message out of an axios error hitting this API. */
export function extractApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorShape | undefined
    if (data?.message) return data.message
  }
  if (err instanceof Error) return err.message
  return fallback
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function registerUser(payload: RegisterPayload) {
  const res = await api.post<ApiSuccess<RegisterResponseData>>('/auth/register', payload)
  return res.data.data
}

export async function loginUser(payload: LoginPayload) {
  const res = await api.post<ApiSuccess<LoginResponseData>>('/auth/login', payload)
  return res.data.data
}

export async function createGuestSession(payload: GuestCreatePayload) {
  const res = await api.post<ApiSuccess<GuestCreateResponseData>>('/quest/create', payload)
  return res.data.data
}

// ---------------------------------------------------------------------------
// Room
// ---------------------------------------------------------------------------

export async function createRoomRest(payload: RoomCreatePayload) {
  const res = await api.post<ApiSuccess<RoomCreateResponseData>>('/room/create', payload)
  return res.data.data
}

// ---------------------------------------------------------------------------
// Questions (predefined mode, host-only)
// ---------------------------------------------------------------------------

export async function bulkCreateQuestions(roomId: string, payload: BulkQuestionCreatePayload) {
  const res = await api.post<ApiSuccess<null>>(`/question/${roomId}`, payload)
  return res.data.message
}

export async function getRoomQuestions(roomId: string) {
  const res = await api.get<ApiSuccess<Question[]>>(`/question/${roomId}`)
  return res.data.data
}

export async function updateQuestion(roomId: string, questionId: string, payload: QuestionInput) {
  const res = await api.patch<ApiSuccess<null>>(`/question/${roomId}/${questionId}`, payload)
  return res.data.message
}

export async function deleteQuestion(roomId: string, questionId: string) {
  const res = await api.delete<ApiSuccess<null>>(`/question/${roomId}/${questionId}`)
  return res.data.message
}

// Live mode only: author the NEXT question while the quiz is already
// running. This does NOT broadcast it to players - the host must still
// fire the `question:next` socket event to actually advance to it.
export async function createLiveQuestion(roomId: string, payload: QuestionInput) {
  const res = await api.post<ApiSuccess<null>>(`/live-question/${roomId}`, payload)
  return res.data.message
}
