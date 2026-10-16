import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import AuthLayout from "../../components/auth/AuthLayout/AuthLayout";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearError, login } from "../../store/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = (location.state as { registered?: boolean } | null)
    ?.registered;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const loading = useAppSelector((s) => s.auth.status === "loading");

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) navigate("/");
  }

  return (
    <AuthLayout
      eyebrow="Quizvora Universal Sign-In"
      switchText="Don't have an account?"
      switchLabel="Sign up free"
      switchTo="/register"
      title="Welcome back to Quizvora"
      subtitle="One account to host live games, join any room, and track all your quiz history and rankings."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {registered && (
          <Alert
            tone="success"
            message="Account created! Sign in to continue."
          />
        )}
        <TextField
          label="Email"
          icon="alternate_email"
          type="email"
          placeholder="alex@quizvora.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          icon="lock"
          type="password"
          placeholder="••••••••••••"
          autoComplete="current-password"
          required
          minLength={6}
          maxLength={20}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="auth-form__row">
          <label className="auth-form__check">
            <input type="checkbox" defaultChecked />
            <span>Remember this device for 30 days</span>
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        {error && <Alert message={error} />}
        <Button
          type="submit"
          icon="arrow_forward"
          subLabel="Access your dashboard, history & live rooms"
          loading={loading}
          loadingText="Signing in..."
        >
          Sign In to Quizvora
        </Button>
      </form>
    </AuthLayout>
  );
}
