import type { LoginResponse } from "./api";

const AUTH_STORAGE_KEY = "quizvora:auth";

export function saveAuth(auth: LoginResponse): void {
  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ type: "User", ...auth }),
  );
}

export function readAuth(): (LoginResponse & { type: "User" }) | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
