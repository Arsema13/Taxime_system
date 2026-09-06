import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { authService } from '@/services';
import { useToast } from '@/contexts';

export default function RegisterPage() {
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!form.password.trim()) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toastSuccess('Account Created', 'Your account has been created. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      toastError('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Create an account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Join Taxime to manage tasks and collaborate with your team
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="John"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 pl-11 pr-4 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67] ${
                  errors.firstName ? 'border-rose-400 focus:ring-rose-400/20' : 'border-slate-200/80 dark:border-slate-600/80'
                }`}
              />
            </div>
            {errors.firstName && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.firstName}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Doe"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 pl-11 pr-4 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67] ${
                    errors.lastName ? 'border-rose-400 focus:ring-rose-400/20' : 'border-slate-200/80 dark:border-slate-600/80'
                  }`}
              />
            </div>
            {errors.lastName && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              placeholder="you@taxime.com"
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
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Phone <span className="text-slate-400 dark:text-slate-500 normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-600/80 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 pl-11 pr-4 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="new-password"
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
          {errors.password && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 pl-11 pr-4 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67] ${
                  errors.confirmPassword ? 'border-rose-400 focus:ring-rose-400/20' : 'border-slate-200/80 dark:border-slate-600/80'
                }`}
            />
          </div>
          {errors.confirmPassword && <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.confirmPassword}</p>}
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
              <span>Create Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[#FF4D67] hover:text-[#E83D58] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
