import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts';
import { useToast } from '@/contexts';

export default function LoginPage() {
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!form.password.trim()) {
      e.password = 'Password is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password. Please check your credentials.';
      toastError('Sign In Failed', msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (email: string, pass: string = 'password123') => {
    setForm({ email, password: pass });
    setErrors({});
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black text-[#0B1628] dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-[#0B1628]/50 dark:text-white/40 text-xs sm:text-sm mt-1">
          Enter your credentials to access your operations dashboard
        </p>
      </div>

      <div className="mb-6 p-3 bg-[#F0F2F7] dark:bg-white/5 rounded-2xl border border-[#0B1628]/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#0B1628]/40 dark:text-white/30 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-[#e89b1a]" />
            Quick Demo Login
          </span>
          <span className="text-[10px] text-[#0B1628]/30 dark:text-white/20">Click to fill</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setDemoCredentials('commander@gmail.com')}
            className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-white/10 hover:bg-[#e89b1a]/10 text-[#0B1628] dark:text-white/70 hover:text-[#e89b1a] border border-[#0B1628]/10 dark:border-white/10 transition-all shadow-2xs active:scale-95"
          >
            Commander
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('hana@gmail.com')}
            className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-white/10 hover:bg-[#e89b1a]/10 text-[#0B1628] dark:text-white/70 hover:text-[#e89b1a] border border-[#0B1628]/10 dark:border-white/10 transition-all shadow-2xs active:scale-95"
          >
            Team Lead
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('arsema@gmail.com')}
            className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-white/10 hover:bg-[#e89b1a]/10 text-[#0B1628] dark:text-white/70 hover:text-[#e89b1a] border border-[#0B1628]/10 dark:border-white/10 transition-all shadow-2xs active:scale-95"
          >
            Driver / Member
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#0B1628] dark:text-white/70 uppercase tracking-wider">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1628]/30 dark:text-white/30" />
            <input
              type="email"
              placeholder="you@gmail.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`w-full rounded-2xl border bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 focus:bg-white dark:focus:bg-white/10 text-sm text-[#0B1628] dark:text-white placeholder:text-[#0B1628]/30 dark:placeholder:text-white/20 py-3 pl-11 pr-4 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#e89b1a]/20 focus:border-[#e89b1a] ${
                errors.email ? 'border-[#e89b1a] focus:ring-[#e89b1a]/20' : 'border-[#0B1628]/10 dark:border-white/10'
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-[#e89b1a] font-medium pl-1">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#0B1628] dark:text-white/70 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#e89b1a] hover:text-[#f4b728] hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B1628]/30 dark:text-white/30" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={`w-full rounded-2xl border bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 focus:bg-white dark:focus:bg-white/10 text-sm text-[#0B1628] dark:text-white placeholder:text-[#0B1628]/30 dark:placeholder:text-white/20 py-3 pl-11 pr-11 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#e89b1a]/20 focus:border-[#e89b1a] ${
                errors.password ? 'border-[#e89b1a] focus:ring-[#e89b1a]/20' : 'border-[#0B1628]/10 dark:border-white/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B1628]/30 dark:text-white/30 hover:text-[#0B1628] dark:hover:text-white p-1 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-[#e89b1a] font-medium pl-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#0B1628]/60 dark:text-white/40 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#e89b1a] focus:ring-[#e89b1a] border-[#0B1628]/20 dark:border-white/20 accent-[#e89b1a]"
            />
            Keep me signed in
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-6 rounded-full bg-[#e89b1a] text-[#0B1628] hover:bg-[#f4b728] font-bold text-sm shadow-lg shadow-[#e89b1a]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-[#0B1628] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#0B1628]/40 dark:text-white/30 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-[#e89b1a] hover:text-[#f4b728] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
