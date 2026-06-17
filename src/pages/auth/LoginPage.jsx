import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getAuthErrorMessage } from "../../utils/authErrors";
import AuthLayout from "./AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();

  const { login } = useAuth();
  const navigate = useNavigate();

  // Show one-shot success banners coming from confirm / reset-password flows
  useEffect(() => {
    if (params.get("confirmed") === "1") {
      toast.success("Email verified! You can now sign in.");
    } else if (params.get("reset") === "1") {
      toast.success("Password reset successfully! Please sign in with your new password.");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Sign in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-15px_rgba(14,165,233,0.8)] transition hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-sky-600 hover:text-sky-700 font-medium">
          Forgot password?
        </Link>
        <Link to="/register" className="text-sky-600 hover:text-sky-700 font-medium">
          Create account →
        </Link>
      </div>
    </AuthLayout>
  );
}
