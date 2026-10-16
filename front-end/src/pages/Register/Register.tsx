import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import AuthLayout from "../../components/auth/AuthLayout/AuthLayout";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearError, register } from "../../store/authSlice";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const loading = useAppSelector((s) => s.auth.status === "loading");

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (user) return <Navigate to="/" replace />;

  const mismatch =
    form.confirmPassword !== "" && form.password !== form.confirmPassword;

  const update =
    (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    const result = await dispatch(
      register({ ...form, name: form.name.trim(), email: form.email.trim() }),
    );
    if (register.fulfilled.match(result)) {
      navigate("/login", { state: { notice: "Account created! Sign in to continue." } });
    }
  }

  return (
    <AuthLayout
      eyebrow="Quizvora Universal Sign-Up"
      switchText="Already have an account?"
      switchLabel="Sign in"
      switchTo="/login"
      title="Create your Quizvora account"
      subtitle="One account to host live games, join any room, and track all your quiz history and rankings."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <TextField
          label="Full name"
          icon="person"
          placeholder="Alex Player"
          autoComplete="name"
          required
          value={form.name}
          onChange={update("name")}
        />
        <TextField
          label="Email"
          icon="alternate_email"
          type="email"
          placeholder="alex@quizvora.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
        />
        <TextField
          label="Password"
          icon="lock"
          type="password"
          placeholder="6-20 characters"
          autoComplete="new-password"
          required
          minLength={6}
          maxLength={20}
          value={form.password}
          onChange={update("password")}
        />
        <TextField
          label="Confirm password"
          icon="lock_reset"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          minLength={6}
          maxLength={20}
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          error={mismatch ? "Passwords do not match" : undefined}
        />
        {error && <Alert message={error} />}
        <Button
          type="submit"
          icon="arrow_forward"
          subLabel="Host quizzes, join rooms & track your rankings"
          loading={loading}
          loadingText="Creating account..."
          disabled={mismatch}
        >
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
}
