import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts';
import { useToast } from '@/contexts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const { login }   = useAuth();
  const { error: toastError } = useToast();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = (location.state as { from?: string })?.from ?? '/dashboard';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password.trim()) e.password = 'Password is required';
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
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password';
      toastError('Login failed', msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in to your Taxime account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@taxime.com"
          autoComplete="email"
          autoFocus
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
          icon={<Lock className="w-4 h-4" />}
          iconRight={showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          onIconRightClick={() => setShowPw((s) => !s)}
          required
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          icon={<LogIn className="w-5 h-5" />}
        >
          Sign In
        </Button>
      </form>

      {/* Demo hint */}
      <div className="mt-6 p-3 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-xs text-teal-700 font-medium text-center">
          Need access? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}
