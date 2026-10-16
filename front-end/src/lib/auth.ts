import type { LoginResponse } from "./api";

const AUTH_STORAGE_KEY = "quizvora:auth";

export interface GuestIdentity {
  sessionId: string;
  name: string;
}

function read(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: LoginResponse): void {
  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ type: "User", ...auth }),
  );
}

export function readAuth(): (LoginResponse & { type: "User" }) | null {
  const data = read();
  return data?.type === "User" ? (data as never) : null;
}

export function saveGuest(guest: GuestIdentity): void {
  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ type: "Guest", ...guest }),
  );
}

export function readGuest(): GuestIdentity | null {
  const data = read();
  return data?.type === "Guest" ? (data as never) : null;
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
