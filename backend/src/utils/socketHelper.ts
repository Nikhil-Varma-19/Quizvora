import { SocketResponse } from "./types";

export const socketSuccess = <T>(message: string, data: T): SocketResponse<T> => ({
  success: true,
  message,
  data,
});

export const socketError = (message: string): SocketResponse<never> => ({
  success: false,
  message,
  data: null,
});