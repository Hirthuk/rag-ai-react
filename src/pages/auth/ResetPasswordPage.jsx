import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";
import AuthLayout from "./AuthLayout";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    email: params.get("email") ?? "",
    confirmationCode: "",
    newPassword: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: form.email,
        confirmationCode: form.confirmationCode,
        newPassword: form.newPassword,
      });
      navigate("/login?reset=1");
    } catch (err) {
      toast.error(
        getAuthErrorMessage(err, "Password reset failed. Please check the code and try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter the code from your email and choose a new password">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Reset code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.confirmationCode}
            onChange={set("confirmationCode")}
            placeholder="6-digit code"
            required
            className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white tracking-[0.3em]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={set("newPassword")}
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
            Confirm new password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="Repeat new password"
            required
            autoComplete="new-password"
            className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-15px_rgba(14,165,233,0.8)] transition hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Resetting…" : "Reset password"}
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
