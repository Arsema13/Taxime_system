import React, { useEffect, useState } from 'react';
import {
  BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CheckSquare, AlertTriangle, Clock, TrendingUp,
  Building2, ArrowUpRight, Sparkles, Plus, Users, Calendar, BarChart,
} from 'lucide-react';
import { dashboardService } from '@/services';
import type { CommanderDashboard as TCommanderDashboard } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { TaskProgress } from '@/components/task/TaskProgress';
import { TaskStatusBadge } from '@/components/task/TaskStatusBadge';
import { useAuth } from '@/contexts';
import { Link, useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#e89b1a','#10B981','#F59E0B','#3B82F6','#8B5CF6','#06B6D4','#EC4899','#64748B'];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94a3b8', PENDING: '#3b82f6', ACCEPTED: '#6366f1', IN_PROGRESS: '#3b82f6',
  SUBMITTED_FOR_REVIEW: '#8b5cf6', UNDER_REVIEW: '#a78bfa', COMPLETED: '#10b981',
  REJECTED: '#ff4d67', ON_HOLD: '#f59e0b', CANCELLED: '#cbd5e1', OVERDUE: '#dc2626',
};

export default function AdminDashboard() {
  const { user }  = useAuth();
  const navigate = useNavigate();
  const [data,    setData]    = useState<TCommanderDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try { setData(await dashboardService.getCommanderDashboard()); }
    catch  { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader message="Loading dashboard…" />;
  if (error)   return <ErrorState message="Could not load dashboard." onRetry={load} />;
  if (!data)   return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const safeSlice = (arr: any[], n: number) => (Array.isArray(arr) ? arr.slice(0, n) : []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <PageHeader
          title={`${greeting()}, ${user?.firstName}`}
          description={
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e89b1a]" />
              {today}
            </span>
          }
        />
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/tasks/new')}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#e89b1a]/5 dark:bg-[#e89b1a]/10 border border-[#e89b1a]/20 dark:border-[#e89b1a]/20 flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6 text-[#e89b1a]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats?.totalTasks || 0}</p>
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
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats?.completedTasks || 0}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 dark:border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-0.5">
            {data.stats?.completionRate || 0}%
          </span>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</p>
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats?.inProgressTasks || 0}</p>
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue</p>
              <p className="text-2xl font-black text-[#0B1628] dark:text-slate-100 mt-0.5">{data.stats?.overdueTasks || 0}</p>
            </div>
          </div>
          {Number(data.stats?.overdueTasks) > 0 && (
            <span className="text-[11px] font-bold text-[#e89b1a] bg-[#e89b1a]/5 border border-[#e89b1a]/20 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              Needs attention
            </span>
          )}
        </div>
      </div>

      {/* ── 3-COLUMN MODERN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── COLUMN 1: Tasks by Status & Priority (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Tasks by Status Pie Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#e89b1a] text-white flex items-center justify-center">
                  <CheckSquare size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Tasks by Status</h3>
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
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                    >
                      {data.tasksByStatus.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {safeSlice(data.tasksByStatus, 6).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] ?? CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="truncate">{s.status.replace(/_/g,' ')}</span>
                      <span className="ml-auto font-bold text-[#0B1628] dark:text-slate-100">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-slate-400 dark:text-slate-400 text-center py-12 text-sm">No status data available</p>}
          </div>

          {/* Tasks by Priority Bar Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#0B1628] dark:bg-slate-600 text-white flex items-center justify-center">
                  <BarChart size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Tasks by Priority</h3>
              </div>
            </div>
            {data.tasksByPriority && data.tasksByPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={data.tasksByPriority} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8,8,0,0]}>
                    {data.tasksByPriority.map((entry, i) => {
                      const c = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };
                      return <Cell key={i} fill={c[entry.priority as keyof typeof c] ?? '#e89b1a'} />;
                    })}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 dark:text-slate-400 text-center py-12 text-sm">No priority data available</p>}
          </div>
        </div>

        {/* ── COLUMN 2: Employee Workload & Recent Tasks (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Employee Workload */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Users size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Employee Workload</h3>
              </div>
              <Link to="/employees" className="text-xs text-[#e89b1a] hover:text-[#f4b728] font-semibold flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            {data.employeeWorkload && data.employeeWorkload.length > 0 ? (
              <div className="flex flex-col gap-3">
                {safeSlice(data.employeeWorkload, 5).map((emp, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="w-9 h-9 rounded-full bg-[#e89b1a]/10 border border-[#e89b1a]/20 flex items-center justify-center shrink-0 text-xs font-bold text-[#e89b1a]">
                      {emp.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{emp.name}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{emp.completed}/{emp.total}</span>
                      </div>
                      <TaskProgress progress={emp.total ? Math.round((emp.completed / emp.total) * 100) : 0} size="sm" showLabel />
                    </div>
                    {emp.overdue > 0 && (
                      <span className="text-[10px] font-bold text-[#e89b1a] bg-[#e89b1a]/5 border border-[#e89b1a]/20 px-2 py-0.5 rounded-full shrink-0">
                        {emp.overdue} overdue
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-400 dark:text-slate-400 text-center py-12 text-sm">No employee data available</p>}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#e89b1a] text-white flex items-center justify-center">
                  <Sparkles size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Recent Tasks</h3>
              </div>
              <Link to="/tasks" className="text-xs text-[#e89b1a] hover:text-[#f4b728] font-semibold flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {!data.recentTasks || data.recentTasks.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-400 text-sm text-center py-4">No recent tasks.</p>
              ) : (
                safeSlice(data.recentTasks, 5).map((task: any) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-sm font-semibold text-[#0B1628] dark:text-slate-100 truncate">{task.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 font-medium">
                        {task.priority}
                      </p>
                    </div>
                    <TaskStatusBadge status={task.status} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Team Members & Quick Stats (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Team Overview Card */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Users size={11} />
                </div>
                <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Team Overview</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e89b1a]/5 dark:bg-[#e89b1a]/10 border border-[#e89b1a]/20 dark:border-[#e89b1a]/20 flex items-center justify-center shrink-0">
                    <CheckSquare size={18} className="text-[#e89b1a]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
                    <p className="text-lg font-black text-[#0B1628] dark:text-slate-100">{data.stats?.totalTasks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completion Rate</p>
                    <p className="text-lg font-black text-[#0B1628] dark:text-slate-100">{data.stats?.completionRate || 0}%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Tasks</p>
                    <p className="text-lg font-black text-[#0B1628] dark:text-slate-100">{data.stats?.overdueTasks || 0}</p>
                  </div>
                </div>
              </div>
            </div>
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
                to="/tasks/new"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#e89b1a] text-white hover:bg-[#f4b728] transition-colors"
              >
                <Plus size={18} />
                <span className="text-sm font-semibold">Create New Task</span>
              </Link>
              <Link
                to="/tasks"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                <CheckSquare size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View All Tasks</span>
              </Link>
              <Link
                to="/teams"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                <Users size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Manage Teams</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                <Building2 size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
