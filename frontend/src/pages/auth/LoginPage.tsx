import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts';
import { useToast } from '@/contexts';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
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

  const setDemoCredentials = (email: string, pass: string = 'Password123!') => {
    setForm({ email, password: pass });
    setErrors({});
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Welcome back</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Enter your credentials to access your operations dashboard
        </p>
      </div>

      <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-[#FF4D67]" />
            Quick Demo Login
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Click to fill</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setDemoCredentials('commander@gmail.com')}
            className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-700 dark:text-slate-300 hover:text-[#FF4D67] border border-slate-200/80 dark:border-slate-600/80 transition-all shadow-2xs active:scale-95"
          >
            Commander
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('hana@gmail.com')}
            className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-700 dark:text-slate-300 hover:text-[#FF4D67] border border-slate-200/80 dark:border-slate-600/80 transition-all shadow-2xs active:scale-95"
          >
            Team Lead
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('arsema@gmail.com')}
            className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-700 dark:text-slate-300 hover:text-[#FF4D67] border border-slate-200/80 dark:border-slate-600/80 transition-all shadow-2xs active:scale-95"
          >
            Driver / Member
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              placeholder="you@gmail.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 pl-11 pr-4 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67] ${
                errors.email ? 'border-rose-400 focus:ring-rose-400/20' : 'border-slate-200/80 dark:border-slate-600/80'
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#FF4D67] hover:text-[#E83D58] hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 pl-11 pr-11 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67] ${
                errors.password ? 'border-rose-400 focus:ring-rose-400/20' : 'border-slate-200/80 dark:border-slate-600/80'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF4D67] focus:ring-[#FF4D67] border-slate-300 dark:border-slate-600 accent-[#FF4D67]"
            />
            Keep me signed in
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-6 rounded-full bg-[#FF4D67] text-white hover:bg-[#E83D58] font-bold text-sm shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-[#FF4D67] hover:text-[#E83D58] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
