import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import * as api from "../lib/mockApi";
import { useAuth } from "../context/AuthContext";

const LOCK_SECONDS = 5 * 60;

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const pending = location.state?.pendingRegistration;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [lockedFor, setLockedFor] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    location.state?.devOtp
      ? `Demo mode: no SMS/email is sent yet, so your code is ${location.state.devOtp}.`
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!pending) navigate("/register", { replace: true });
  }, [pending, navigate]);

  useEffect(() => {
    if (lockedFor <= 0) return;
    const t = setInterval(() => setLockedFor((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [lockedFor]);

  if (!pending) return null;

  const handleChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[idx] = value;
    setDigits(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    setDigits(text.padEnd(6, "").split("").slice(0, 6));
  };

  const resend = async () => {
    setError("");
    try {
      const { devOtp } = await api.sendOtp({ email: pending.email, purpose: "register" });
      setAttemptsLeft(3);
      setDigits(["", "", "", "", "", ""]);
      setNotice(`A new code was generated. Demo mode: it's ${devOtp}.`);
    } catch (err) {
      setError(err.message);
      if (/wait/i.test(err.message)) setLockedFor(LOCK_SECONDS);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length < 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setSubmitting(true);
    try {
      await api.verifyOtp({ email: pending.email, code });
      const { confirm, ...payload } = pending;
      await api.register(payload);
      await login({ email: pending.email, password: pending.password });
      navigate(pending.role === "trainer" ? "/trainer" : "/trainee", { replace: true });
    } catch (err) {
      setError(err.message);
      if (/wait 5 minutes/i.test(err.message)) {
        setLockedFor(LOCK_SECONDS);
        setAttemptsLeft(0);
      } else {
        setAttemptsLeft((n) => Math.max(0, n - 1));
      }
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const mins = String(Math.floor(lockedFor / 60)).padStart(2, "0");
  const secs = String(lockedFor % 60).padStart(2, "0");

  return (
    <AuthLayout
      eyebrow="Step 2 of 2"
      title="Verify your email"
      description={`We sent a 6-digit code to ${pending.email}.`}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={lockedFor > 0}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-xl border border-paper-200 bg-paper-50 text-center font-mono text-xl font-semibold text-ink-900 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 disabled:opacity-40 sm:w-14"
            />
          ))}
        </div>

        {notice && !error && (
          <p className="flex items-start gap-2 rounded-xl bg-teal-500/10 px-3.5 py-2.5 text-xs text-teal-700">
            <ShieldCheck size={15} className="mt-0.5 shrink-0" />
            {notice}
          </p>
        )}

        {error && <p className="rounded-xl bg-coral-500/10 px-3.5 py-2.5 text-sm text-coral-600">{error}</p>}

        {lockedFor > 0 && (
          <p className="font-mono text-sm text-coral-600">
            Locked. Try again in {mins}:{secs}
          </p>
        )}

        {!error && lockedFor === 0 && attemptsLeft < 3 && (
          <p className="text-xs text-ink-500">{attemptsLeft} attempt(s) left before a 5 minute lock.</p>
        )}

        <Button type="submit" className="w-full" loading={submitting} disabled={lockedFor > 0}>
          Verify &amp; create account
        </Button>

        <button
          type="button"
          onClick={resend}
          disabled={lockedFor > 0}
          className="w-full text-center text-sm font-medium text-navy-900 hover:underline disabled:opacity-40"
        >
          Resend code
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Wrong details?{" "}
        <Link to="/register" className="font-medium text-navy-900 hover:underline">
          Start over
        </Link>
      </p>
    </AuthLayout>
  );
}
