import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../lib/api";
import type { LoginPayload, LoginResponse, RegisterPayload } from "../lib/api";
import { clearAuth, readAuth, saveAuth } from "../lib/auth";

interface AuthState {
  user: LoginResponse | null;
  status: "idle" | "loading";
  error: string | null;
}

const persisted = readAuth();

const initialState: AuthState = {
  user: persisted
    ? {
        token: persisted.token,
        userId: persisted.userId,
        email: persisted.email,
        name: persisted.name,
      }
    : null,
  status: "idle",
  error: null,
};

const messageOf = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await loginUser(payload);
  } catch (err) {
    return rejectWithValue(messageOf(err, "Could not sign in."));
  }
});

export const register = createAsyncThunk<
  { name: string; email: string },
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await registerUser(payload);
  } catch (err) {
    return rejectWithValue(messageOf(err, "Could not create account."));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      clearAuth();
      state.user = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, { payload }) => {
        saveAuth(payload);
        state.user = payload;
        state.status = "idle";
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "idle";
      })
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/rejected"),
        (state, action: { payload?: unknown }) => {
          state.status = "idle";
          state.error = (action.payload as string) ?? "Something went wrong";
        },
      );
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
