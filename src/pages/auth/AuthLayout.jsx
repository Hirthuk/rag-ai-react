export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-600">
            FinSight AI
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="rounded-3xl border border-sky-100 bg-white/95 p-8 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.28)] backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
