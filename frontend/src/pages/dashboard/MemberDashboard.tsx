import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CheckSquare, AlertTriangle, Clock, TrendingUp, Plus,
  ArrowUpRight, Sparkles, Calendar, RefreshCw, ClipboardList,
} from 'lucide-react';
import { dashboardService } from '@/services';
import type { MemberDashboard as TMemberDashboard } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/Card';
import { useAuth } from '@/contexts';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:'#94a3b8',PENDING:'#3b82f6',ACCEPTED:'#6366f1',IN_PROGRESS:'#f59e0b',
  SUBMITTED_FOR_REVIEW:'#8b5cf6',UNDER_REVIEW:'#a78bfa',COMPLETED:'#10b981',
  REJECTED:'#ef4444',ON_HOLD:'#64748b',CANCELLED:'#cbd5e1',OVERDUE:'#dc2626',
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<TMemberDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try { setData(await dashboardService.getMemberDashboard()); }
    catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader message="Loading dashboard…" />;
  if (error) return <ErrorState message="Could not load dashboard." onRetry={load} />;
  if (!data) return null;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      {/* ── TOP SECTION: Header & Date Pill ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-2.5 shrink-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1628] dark:text-slate-100 tracking-tight">
            Welcome back, {user?.firstName}
          </h1>
          <div className="inline-flex items-center gap-2 bg-[#0B1628] dark:bg-slate-100 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit shadow-xs dark:shadow-slate-100/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e89b1a]" />
            {today}
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#e89b1a]/5 dark:bg-[#e89b1a]/10 border border-[#e89b1a]/20 dark:border-[#e89b1a]/20 flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6 text-[#e89b1a]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned Tasks</p>
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats.assignedTasks}</p>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</p>
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats.inProgressTasks}</p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats.completedTasks}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-full flex items-center gap-0.5">
            {data.stats.completionRate}%
          </span>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue</p>
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats.overdueTasks}</p>
            </div>
          </div>
          {data.stats.overdueTasks > 0 && (
            <span className="text-[11px] font-bold text-[#e89b1a] bg-[#e89b1a]/5 border border-[#e89b1a]/20 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              Needs attention
            </span>
          )}
        </div>
      </div>

      {/* ── 3-COLUMN MODERN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── COLUMN 1: Tasks by Status & Quick Actions (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Tasks by Status Pie Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#e89b1a] text-white flex items-center justify-center">
                  <CheckSquare size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">My Tasks by Status</h3>
              </div>
            </div>
            {data.tasksByStatus && data.tasksByStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.tasksByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {Array.isArray(data.tasksByStatus) && data.tasksByStatus.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#14b8a6'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {Array.isArray(data.tasksByStatus) && data.tasksByStatus.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: STATUS_COLORS[s.status] ?? '#14b8a6' }}
                      />
                      <span className="truncate">{s.status.replace(/_/g, ' ')}</span>
                      <span className="ml-auto font-bold text-[#0B1628] dark:text-slate-100">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-slate-400 dark:text-slate-400 text-center py-12 text-sm">No status data available</p>}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                  <Calendar size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Quick Actions</h3>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/my-tasks"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#e89b1a] text-white hover:bg-[#f4b728] transition-colors"
              >
                <CheckSquare size={18} />
                <span className="text-sm font-semibold">View All My Tasks</span>
              </Link>
              <Link
                to="/calendar"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View Calendar</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: Upcoming Deadlines (8 cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Calendar size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Upcoming Deadlines</h3>
              </div>
              <Link to="/my-tasks" className="text-xs text-[#e89b1a] hover:text-[#f4b728] font-semibold flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            {data.upcomingDeadlines.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-400 text-sm text-center py-8">No upcoming deadlines.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {data.upcomingDeadlines.slice(0, 5).map((d, i) => (
                  <Link
                    key={i}
                    to={`/tasks/${d.taskId}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{d.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {d.priority.replace(/_/g, ' ')} · {d.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ml-3 ${
                        d.daysLeft <= 1
                          ? 'text-red-600'
                          : d.daysLeft <= 3
                            ? 'text-orange-500'
                            : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {d.daysLeft === 0
                        ? 'Due today'
                        : d.daysLeft < 0
                          ? `${Math.abs(d.daysLeft)}d overdue`
                          : `${d.daysLeft}d left`}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#e89b1a] text-white flex items-center justify-center">
                  <Sparkles size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Recent Activity</h3>
              </div>
              <Link to="/my-tasks" className="text-xs text-[#e89b1a] hover:text-[#f4b728] font-semibold flex items-center gap-1">
                View tasks <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {!data.recentActivity || data.recentActivity.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-400 text-sm text-center py-4">No recent activity.</p>
              ) : (
                data.recentActivity.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="w-8 h-8 bg-[#e89b1a]/10 dark:bg-[#e89b1a]/20 rounded-lg flex items-center justify-center shrink-0 text-[#e89b1a]">
                      {a.action.includes('CREATED') ? <Plus size={14} /> : a.action.includes('STATUS') ? <RefreshCw size={14} /> : <ClipboardList size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400">{a.action.replace(/_/g, ' ').toLowerCase()}</span>
                        {a.taskTitle && (
                          <>
                            {' '}
                            on{' '}
                            <Link to={`/tasks/${a.taskId}`} className="text-[#e89b1a] hover:underline font-medium">
                              {a.taskTitle}
                            </Link>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
