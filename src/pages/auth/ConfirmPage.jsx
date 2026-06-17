import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";
import AuthLayout from "./AuthLayout";

export default function ConfirmPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const code = digits.join("");

  const handleDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.warning("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await authService.confirm({ email, confirmationCode: code });
      navigate("/login?confirmed=1");
    } catch (err) {
      toast.error(
        getAuthErrorMessage(err, "Verification failed. Please check the code and try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.warning("Please enter your email address first.");
      return;
    }
    setResending(true);
    try {
      await authService.forgotPassword({ email });
      toast.info("A new verification code has been sent to your email.");
    } catch (err) {
      toast.error(
        getAuthErrorMessage(err, "Could not resend the code. Please try again.")
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${email || "your email"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {!params.get("email") && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-3">
            Verification code
          </label>
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-11 rounded-xl border border-sky-100 bg-slate-50 text-center text-lg font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-15px_rgba(14,165,233,0.8)] transition hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify email"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-medium text-sky-600 hover:text-sky-700 disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        <Link to="/login" className="text-slate-500 hover:text-slate-700">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
