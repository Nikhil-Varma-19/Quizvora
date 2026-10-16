import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import RecoveryLayout from "../../components/auth/RecoveryLayout/RecoveryLayout";
import TextField from "../../components/ui/TextField/TextField";
import Button from "../../components/ui/Button/Button";
import Alert from "../../components/ui/Alert/Alert";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearError, forgotPassword } from "../../store/authSlice";

const RESEND_SECONDS = 60;

const FEATURES = [
  {
    icon: "timer",
    title: "Encrypted ephemeral tokens",
    text: "Reset links automatically expire in 10 minutes for maximum privacy.",
  },
  {
    icon: "military_tech",
    title: "XP & deck preservation",
    text: "Custom question packs, player trophies, and host stats remain safe.",
  },
  {
    icon: "meeting_room",
    title: "Immediate guest lobby entry",
    text: "Need quick game entry? You can join private rooms as a guest anytime.",
  },
];

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const error = useAppSelector((s) => s.auth.error);
  const loading = useAppSelector((s) => s.auth.status === "loading");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  async function send() {
    const result = await dispatch(forgotPassword({ email: email.trim() }));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
      setSeconds(RESEND_SECONDS);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  return (
    <RecoveryLayout
      badge="Security Portal"
      headline={
        <>
          Forgot password?
          <br />
          Don’t lose your streak.
        </>
      }
      description="Enter your registered email address. We will send a secure, time-limited reset link to get you right back onto the podium."
      cardTitle="Account Shield Protocols"
      features={FEATURES}
      step="Step 1 of 2"
      footer={
        <>
          <p>Got a live game PIN right now?</p>
          <Link to="/join" className="auth__room-btn">
            <span>Enter Room Code</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </>
      }
    >
      <div>
        <h2 className="auth__title">Reset your password</h2>
        <p className="auth__subtitle">
          Enter your email and we will send password recovery instructions
          directly to your inbox.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <TextField
          label="Email address"
          icon="alternate_email"
          type="email"
          placeholder="name@domain.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <Alert message={error} />}
        {sent && (
          <Alert
            tone="success"
            message="If an account exists for this email, a reset link is on its way. Check your spam or promotions tab if it does not arrive within a minute."
          />
        )}
        <Button
          type="submit"
          icon="send"
          loading={loading}
          loadingText="Sending..."
        >
          Send Reset Instructions
        </Button>
      </form>

      {sent && (
        <div className="recovery__resend">
          <span>Did not receive an email?</span>
          <button type="button" disabled={seconds > 0 || loading} onClick={send}>
            {seconds > 0 ? `Resend link (${seconds}s)` : "Resend link now"}
          </button>
        </div>
      )}

      <div className="recovery__link-box">
        <span>Remembered your password?</span>
        <Link to="/login">Log in now</Link>
      </div>
    </RecoveryLayout>
  );
}
