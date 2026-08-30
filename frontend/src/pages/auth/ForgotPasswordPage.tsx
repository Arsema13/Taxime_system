import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

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
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm mb-6">
          If <span className="font-medium text-slate-700">{email}</span> is registered, you'll receive a password reset link shortly.
        </p>
        <Link to="/login" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Reset your password</h2>
        <p className="text-slate-500 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@taxime.com"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          icon={<Mail className="w-4 h-4" />}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}
