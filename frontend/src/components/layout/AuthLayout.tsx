import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F0F2F7] dark:bg-[#0B1628] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#e89b1a]/10 dark:bg-[#e89b1a]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#0B1628]/10 dark:bg-[#0B1628]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#e89b1a]/5 dark:bg-[#e89b1a]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in z-10">
        <div className="text-center mb-6">
          <img src="/image.png" alt="Taxime Logo" className="h-16 w-auto mb-3 hover:scale-105 transition-transform duration-200" />
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1628] dark:text-white tracking-tight">Taxime</h1>
          <p className="text-[#0B1628]/50 dark:text-white/40 mt-1 text-xs sm:text-sm font-medium">Logistics & Operations Management</p>
        </div>

        <div className="bg-white dark:bg-[#111d32] rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200/70 dark:border-white/5 p-6 sm:p-8">
          <Outlet />
        </div>

        <div className="flex flex-col items-center gap-1.5 mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30 font-medium">
            <ShieldCheck size={14} className="text-[#e89b1a]" />
            <span>256-bit encrypted secure session</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-white/30">
            © {new Date().getFullYear()} Taxime System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
