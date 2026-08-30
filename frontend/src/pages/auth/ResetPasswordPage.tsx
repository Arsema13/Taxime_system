import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts';

export default function ResetPasswordPage() {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get('token') ?? '';
  const navigate        = useNavigate();
  const { success, error: toastError } = useToast();

  const [form,    setForm]    = useState({ password: '', confirm: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!token) { toastError('Invalid link', 'The reset link is missing a token.'); return; }
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword({ token, password: form.password });
      success('Password reset!', 'You can now log in with your new password.');
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Reset failed. The link may have expired.';
      toastError('Reset failed', msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Password updated!</h2>
        <p className="text-slate-500 text-sm mb-6">Your password has been reset successfully.</p>
        <Button onClick={() => navigate('/login')} fullWidth>Go to Login</Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 font-medium mb-4">Invalid or missing reset token.</p>
        <Link to="/forgot-password" className="text-teal-600 hover:underline text-sm">Request a new reset link</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Set new password</h2>
        <p className="text-slate-500 text-sm mt-1">Choose a strong password of at least 8 characters.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="New password"
          type={showPw ? 'text' : 'password'}
          placeholder="At least 8 characters"
          autoFocus
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
          icon={<Lock className="w-4 h-4" />}
          iconRight={showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          onIconRightClick={() => setShowPw((s) => !s)}
          required
        />
        <Input
          label="Confirm password"
          type={showPw ? 'text' : 'password'}
          placeholder="Repeat your new password"
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          error={errors.confirm}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        {/* Password strength indicator */}
        {form.password && (
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4].map((i) => {
              const strength = Math.min(4, [
                form.password.length >= 8,
                /[A-Z]/.test(form.password),
                /[0-9]/.test(form.password),
                /[^A-Za-z0-9]/.test(form.password),
              ].filter(Boolean).length);
              const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
              return (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? colors[strength] : 'bg-slate-200'}`}
                />
              );
            })}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}
