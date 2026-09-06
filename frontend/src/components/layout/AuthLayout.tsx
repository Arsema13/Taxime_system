import React from 'react';
import { Outlet } from 'react-router-dom';
import { Flame, ShieldCheck } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F4F5F9] dark:bg-[#0B1120] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FF4D67]/10 dark:bg-[#FF4D67]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-slate-400/10 dark:bg-slate-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-50/50 dark:bg-rose-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FF4D67] text-white shadow-xl shadow-red-500/30 mb-3 hover:scale-105 transition-transform duration-200">
            <Flame size={28} className="fill-white/20 stroke-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Taxime</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">Logistics & Operations Management</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/70 dark:border-slate-700/70 p-6 sm:p-8">
          <Outlet />
        </div>

        <div className="flex flex-col items-center gap-1.5 mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>256-bit encrypted secure session</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Taxime System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
