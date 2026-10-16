import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import RecoveryLayout from "../../components/auth/RecoveryLayout/RecoveryLayout";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import PasswordStrength from "../../components/ui/PasswordStrength/PasswordStrength";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearError, resetPassword } from "../../store/authSlice";

const FEATURES = [
  {
    icon: "check",
    title: "Strong and unique",
    text: "Use 6-20 characters with numbers & special symbols.",
  },
  {
    icon: "block",
    title: "No reuse",
    text: "Never reuse passwords from other gaming or school accounts.",
  },
  {
    icon: "link_off",
    title: "One-time link",
    text: "Your reset link works once and expires after 10 minutes.",
  },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const dispatch = useAppDispatch();
  const error = useAppSelector((s) => s.auth.error);
  const loading = useAppSelector((s) => s.auth.status === "loading");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const mismatch = confirmPassword !== "" && password !== confirmPassword;
  const matches = confirmPassword !== "" && password === confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mismatch) return;
    const result = await dispatch(
      resetPassword({ token, password, confirmPassword }),
    );
    if (resetPassword.fulfilled.match(result)) {
      navigate("/login", {
        state: { notice: "Password updated! Sign in with your new password." },
      });
    }
  }

  return (
    <RecoveryLayout
      badge="Account Protection"
      headline="Lock in your new key to the arena."
      description="Create a strong, unique password to safeguard your custom quizzes, private rooms, and player XP history."
      cardTitle="Password best practices"
      features={FEATURES}
      step="Step 2 of 2"
      footer={
        <p>Your quiz stats, badges, and hosted question decks are preserved.</p>
      }
    >
      <div>
        <h2 className="auth__title">Set new password</h2>
        <p className="auth__subtitle">
          Enter your new password below. It must be 6-20 characters long.
        </p>
      </div>

      {!token ? (
        <>
          <Alert message="This reset link is missing its token. Please request a new one." />
          <div className="recovery__link-box">
            <span>Need a fresh link?</span>
            <Link to="/forgot-password">Request reset link</Link>
          </div>
        </>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <TextField
            label="New password"
            icon="lock"
            type="password"
            placeholder="••••••••••••"
            autoComplete="new-password"
            required
            minLength={6}
            maxLength={20}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength value={password} />
          <TextField
            label="Confirm new password"
            icon="lock_reset"
            type="password"
            placeholder="••••••••••••"
            autoComplete="new-password"
            required
            minLength={6}
            maxLength={20}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={mismatch ? "Passwords do not match" : undefined}
          />
          {matches && <Alert tone="success" message="Passwords match" />}
          {error && (
            <>
              <Alert message={error} />
              <div className="recovery__link-box">
                <span>Link expired?</span>
                <Link to="/forgot-password">Request a new one</Link>
              </div>
            </>
          )}
          <Button
            type="submit"
            icon="arrow_forward"
            loading={loading}
            loadingText="Updating..."
            disabled={mismatch}
          >
            Update Password
          </Button>
        </form>
      )}
    </RecoveryLayout>
  );
}
