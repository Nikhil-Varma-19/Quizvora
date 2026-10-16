import { readAuth, readGuest } from "./auth";
import type { BulkQuestionCreatePayload, QuestionInput } from "../types/game";

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "http://localhost:7000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiSuccess<T> {
  message: string;
  data: T;
}

// Registered users send `Authorization: Bearer <jwt>`, guests send `session-id`.
// Never both - the backend checks Authorization first.
function authHeaders(): Record<string, string> {
  const user = readAuth();
  if (user) return { Authorization: `Bearer ${user.token}` };
  const guest = readGuest();
  if (guest) return { "session-id": guest.sessionId };
  return {};
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      json?.message ?? json?.error ?? "Something went wrong",
      res.status,
    );
  }
  return (json as ApiSuccess<T>).data;
}

// Auth

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const loginUser = (payload: LoginPayload) =>
  post<LoginResponse>("/auth/login", payload);

export const logoutRequest = () => post<null>("/auth/logout", {});

export const registerUser = (payload: RegisterPayload) =>
  post<{ name: string; email: string }>("/auth/register", payload);

export const forgotPasswordRequest = (payload: { email: string }) =>
  post<null>("/auth/forgot-password", payload);

export const resetPasswordRequest = (payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) => post<null>("/auth/reset-password", payload);

export const createGuestSession = (payload: { name: string }) =>
  post<{ name: string; sessionId: string }>("/quest/create", payload);

// Questions

/** Predefined mode: author every question upfront. */
export const bulkCreateQuestions = (
  roomId: string,
  payload: BulkQuestionCreatePayload,
) => post<null>(`/question/${roomId}`, payload);

/** Live mode: author the NEXT question. The host must still emit `question:next` to reveal it. */
export const createLiveQuestion = (roomId: string, payload: QuestionInput) =>
  post<null>(`/live-question/${roomId}`, payload);
