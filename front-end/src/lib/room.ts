import type { ModePlay, ResultMode } from "../types/game";

const ROOM_STORAGE_KEY = "quizvora:active-room";

export interface PersistedRoom {
  roomId: string;
  code: string;
  title: string | null;
  mode: ModePlay | null;
  resultMode: ResultMode | null;
  isHost: boolean;
}

export function saveRoom(room: PersistedRoom): void {
  sessionStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(room));
}

export function readRoom(): PersistedRoom | null {
  try {
    const raw = sessionStorage.getItem(ROOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearRoom(): void {
  sessionStorage.removeItem(ROOM_STORAGE_KEY);
}
