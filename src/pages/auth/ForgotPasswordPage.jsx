import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";
import AuthLayout from "./AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success("Reset code sent! Check your email inbox.");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(
        getAuthErrorMessage(err, "Could not send reset code. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset code"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-15px_rgba(14,165,233,0.8)] transition hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending code…" : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-sky-600 hover:text-sky-700">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
