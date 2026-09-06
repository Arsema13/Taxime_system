import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { authService } from '@/services';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch {
      setError('Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-150 dark:border-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-sm">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Check your inbox</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6">
          If <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span> is registered, instructions to reset your password have been sent.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FF4D67] text-white hover:bg-[#E83D58] font-bold text-xs shadow-md shadow-red-500/25 transition-all"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Sign In
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Reset password</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Enter your registered email address to receive recovery instructions.
        </p>
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
              placeholder="you@taxime.com"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 pl-11 pr-4 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/20 focus:border-[#FF4D67] ${
                error ? 'border-rose-400' : 'border-slate-200/80 dark:border-slate-600/80'
              }`}
            />
          </div>
          {error && <p className="text-[11px] text-rose-500 font-medium pl-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-6 rounded-full bg-[#FF4D67] text-white hover:bg-[#E83D58] font-bold text-sm shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Send Recovery Link</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
