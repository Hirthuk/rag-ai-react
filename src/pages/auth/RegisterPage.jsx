import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";
import AuthLayout from "./AuthLayout";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success("Account created! Check your email for the 6-digit verification code.");
      navigate(`/confirm?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast.error(
        getAuthErrorMessage(err, "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start your FinSight AI journey">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Full name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Jane Smith"
            required
            autoComplete="name"
            className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
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
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Confirm password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
            className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-15px_rgba(14,165,233,0.8)] transition hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-sky-600 hover:text-sky-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
