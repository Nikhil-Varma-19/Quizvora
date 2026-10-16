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

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

export const registerUser = (payload: RegisterPayload) =>
  post<{ name: string; email: string }>("/auth/register", payload);

export const forgotPasswordRequest = (payload: { email: string }) =>
  post<null>("/auth/forgot-password", payload);

export const resetPasswordRequest = (payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) => post<null>("/auth/reset-password", payload);
