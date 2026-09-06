import React, { useEffect, useState } from 'react';
import {
  BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CheckSquare, AlertTriangle, Clock, Users, TrendingUp,
  ArrowUpRight, Plus, Sparkles, Calendar, BarChart,
} from 'lucide-react';
import { dashboardService } from '@/services';
import type { TeamLeadDashboard as TTeamLeadDashboard } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { TaskProgress } from '@/components/task/TaskProgress';
import { useAuth } from '@/contexts';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:'#94a3b8',PENDING:'#3b82f6',ACCEPTED:'#6366f1',IN_PROGRESS:'#f59e0b',
  SUBMITTED_FOR_REVIEW:'#8b5cf6',UNDER_REVIEW:'#a78bfa',COMPLETED:'#10b981',
  REJECTED:'#ef4444',ON_HOLD:'#64748b',CANCELLED:'#cbd5e1',OVERDUE:'#dc2626',
};

export default function TeamLeadDashboard() {
  const { user }  = useAuth();
  const navigate = useNavigate();
  const [data,    setData]    = useState<TTeamLeadDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try { setData(await dashboardService.getTeamLeadDashboard()); }
    catch  { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader message="Loading dashboard…" />;
  if (error)   return <ErrorState message="Could not load dashboard." onRetry={load} />;
  if (!data)   return null;

  const completionRate = Number(data?.stats?.completionRate ?? 0) || 0;
  const tasksByStatus = Array.isArray(data?.tasksByStatus) ? data.tasksByStatus : [];
  const memberWorkload = Array.isArray(data?.memberWorkload) ? data.memberWorkload : [];
  const recentActivity = Array.isArray(data?.recentActivity) ? data.recentActivity : [];
  const upcomingDeadlines = Array.isArray(data?.upcomingDeadlines) ? data.upcomingDeadlines : [];

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Team Overview, {user?.firstName}
          </h1>
          <div className="inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit shadow-xs dark:shadow-slate-100/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D67]" />
            {today}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/tasks/new')}
            className="inline-flex items-center gap-1.5 bg-[#FF4D67] text-white hover:bg-[#E83D58] px-5 py-2 rounded-full text-xs font-bold shadow-md shadow-red-500/25 dark:shadow-red-500/40 transition-all active:scale-[0.98]"
          >
            <Plus size={15} />
            Create Task
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6 text-[#FF4D67]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Team Tasks</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{data.stats?.totalTasks ?? 0}</p>
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
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{data.stats?.completedTasks ?? 0}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-full flex items-center gap-0.5">
            {completionRate}%
          </span>
        </div>

        {/* Pending Review */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-4.5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Review</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{data.stats?.pendingReview ?? 0}</p>
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
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{data.stats?.overdueTasks ?? 0}</p>
            </div>
          </div>
          {Number(data.stats?.overdueTasks) > 0 && (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-150 px-2.5 py-1 rounded-full flex items-center gap-0.5">
              Needs attention
            </span>
          )}
        </div>
      </div>

      {/* ── 3-COLUMN MODERN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── COLUMN 1: Tasks by Status & Member Workload (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Tasks by Status Pie Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#FF4D67] text-white flex items-center justify-center">
                  <CheckSquare size={11} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Tasks by Status</h3>
              </div>
            </div>
            {tasksByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tasksByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {tasksByStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#14b8a6'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 dark:text-slate-400 text-center py-12 text-sm">No status data available</p>}
          </div>

          {/* Member Workload Bar Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white flex items-center justify-center">
                  <BarChart size={11} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Member Workload</h3>
              </div>
            </div>
            {memberWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={memberWorkload.slice(0,8)} barSize={20} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="total"     fill="#e2e8f0" radius={[0,4,4,0]} name="Total" />
                  <Bar dataKey="completed" fill="#14b8a6" radius={[0,4,4,0]} name="Completed" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 dark:text-slate-400 text-center py-12 text-sm">No workload data available</p>}
          </div>
        </div>

        {/* ── COLUMN 2: Member Performance & Upcoming Deadlines (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Member Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Users size={11} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Member Performance</h3>
              </div>
              <Link to="/teams" className="text-xs text-[#FF4D67] hover:text-[#E83D58] font-semibold flex items-center gap-1">
                View team <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {memberWorkload.slice(0, 4).map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60">
                  <Avatar src={m.avatar} name={m.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{m.name}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{m.completed}/{m.total}</span>
                    </div>
                    <TaskProgress progress={m.total ? Math.round((m.completed / m.total) * 100) : 0} size="sm" showLabel />
                  </div>
                  {m.overdue > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-full shrink-0">
                      {m.overdue} overdue
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Calendar size={11} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Upcoming Deadlines</h3>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {upcomingDeadlines.slice(0, 4).map((d, i) => (
                  <Link key={i} to={`/tasks/${d.taskId}`} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{d.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.priority.replace(/_/g,' ')}</p>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ml-3 ${d.daysLeft <= 1 ? 'text-red-600' : d.daysLeft <= 3 ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {d.daysLeft === 0 ? 'Due today' : d.daysLeft < 0 ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d left`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── COLUMN 3: Recent Activity & Quick Actions (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#FF4D67] text-white flex items-center justify-center">
                  <Sparkles size={11} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Recent Activity</h3>
              </div>
              <Link to="/activity" className="text-xs text-[#FF4D67] hover:text-[#E83D58] font-semibold flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentActivity.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60">
                  <Avatar src={a.userAvatar} name={a.userName} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{a.userName}</span>{' · '}
                      <span className="text-slate-500 dark:text-slate-400">{a.action.replace(/_/g, ' ').toLowerCase()}</span>
                      {a.taskTitle && <> on <Link to={`/tasks/${a.taskId}`} className="text-[#FF4D67] hover:underline font-medium">{a.taskTitle}</Link></>}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                  <Calendar size={11} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Quick Actions</h3>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/tasks/new"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FF4D67] text-white hover:bg-[#E83D58] transition-colors"
              >
                <Plus size={18} />
                <span className="text-sm font-semibold">Create New Task</span>
              </Link>
              <Link
                to="/my-tasks"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                <CheckSquare size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">View My Tasks</span>
              </Link>
              <Link
                to="/teams"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:bg-slate-600/50 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                <Users size={18} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Manage Team</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
