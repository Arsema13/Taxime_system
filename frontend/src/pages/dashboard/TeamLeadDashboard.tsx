import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CheckSquare, AlertTriangle, Clock, Users, TrendingUp, RefreshCw, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { dashboardService } from '@/services';
import type { TeamLeadDashboard as TTeamLeadDashboard } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { StatCard, Card, ErrorState } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { TaskProgress } from '@/components/task/TaskProgress';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:'#94a3b8',PENDING:'#3b82f6',ACCEPTED:'#6366f1',IN_PROGRESS:'#f59e0b',
  SUBMITTED_FOR_REVIEW:'#8b5cf6',UNDER_REVIEW:'#a78bfa',COMPLETED:'#10b981',
  REJECTED:'#ef4444',ON_HOLD:'#64748b',CANCELLED:'#cbd5e1',OVERDUE:'#dc2626',
};

export default function TeamLeadDashboard() {
  const { user }  = useAuth();
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Team Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.firstName}. Here's your team status.</p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={load} loading={loading}>Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><CheckSquare size={16} className="text-teal-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats?.totalTasks ?? 0}</span>
            <p className="text-xs text-slate-500">Team Tasks</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><TrendingUp size={16} className="text-emerald-600" /></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">{data.stats?.completedTasks ?? 0}</span>
              <span className="bg-lime-300 text-xs px-1.5 py-0.5 rounded font-medium">{completionRate}% rate</span>
            </div>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><AlertTriangle size={16} className="text-red-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats?.overdueTasks ?? 0}</span>
            <p className="text-xs text-slate-500">Overdue</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><Clock size={16} className="text-purple-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats?.pendingReview ?? 0}</span>
            <p className="text-xs text-slate-500">Pending Review</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><TrendingUp size={16} className="text-blue-600" /></div>
          <div>
            <span className="font-bold text-lg">{completionRate.toFixed(0)}%</span>
            <p className="text-xs text-slate-500">Completion</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><Users size={16} className="text-indigo-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats?.teamSize ?? 0}</span>
            <p className="text-xs text-slate-500">Team Size</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-sm text-slate-700">Tasks by Status</h2>
            <div className="flex space-x-2">
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><MoreHorizontal size={14} /></button>
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><ArrowUpRight size={14} /></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={tasksByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {tasksByStatus.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#14b8a6'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-sm text-slate-700">Member Workload</h2>
            <div className="flex space-x-2">
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><MoreHorizontal size={14} /></button>
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><ArrowUpRight size={14} /></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={memberWorkload.slice(0,8)} barSize={20} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="total"     fill="#e2e8f0" radius={[0,4,4,0]} name="Total" />
              <Bar dataKey="completed" fill="#14b8a6" radius={[0,4,4,0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-sm text-slate-700">Member Performance</h2>
          <Link to="/teams" className="text-xs text-teal-600 hover:underline font-medium flex items-center gap-1">
            View team <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {memberWorkload.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 border border-white/40">
              <Avatar src={m.avatar} name={m.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-700 truncate">{m.name}</p>
                  <span className="text-xs text-slate-500 shrink-0">{m.completed}/{m.total} tasks</span>
                </div>
                <TaskProgress progress={m.total ? Math.round((m.completed / m.total) * 100) : 0} size="sm" showLabel />
              </div>
              {m.overdue > 0 && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
                  {m.overdue} overdue
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {upcomingDeadlines.length > 0 && (
        <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-sm text-slate-700">Upcoming Deadlines</h2>
            <div className="flex space-x-2">
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><MoreHorizontal size={14} /></button>
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><ArrowUpRight size={14} /></button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingDeadlines.slice(0, 5).map((d, i) => (
              <Link key={i} to={`/tasks/${d.taskId}`} className="flex items-center justify-between p-3 rounded-2xl bg-white/30 hover:bg-white/50 border border-white/40 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{d.priority.replace(/_/g,' ')}</p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ml-3 ${d.daysLeft <= 1 ? 'text-red-600' : d.daysLeft <= 3 ? 'text-orange-500' : 'text-slate-500'}`}>
                  {d.daysLeft === 0 ? 'Due today' : d.daysLeft < 0 ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-sm text-slate-700">Recent Activity</h2>
          <Link to="/activity" className="text-xs text-teal-600 hover:underline font-medium flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentActivity.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white/30 border border-white/40">
              <Avatar src={a.userAvatar} name={a.userName} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{a.userName}</span>{' · '}
                  <span className="text-slate-500">{a.action.replace(/_/g, ' ').toLowerCase()}</span>
                  {a.taskTitle && <> on <Link to={`/tasks/${a.taskId}`} className="text-teal-600 hover:underline">{a.taskTitle}</Link></>}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
