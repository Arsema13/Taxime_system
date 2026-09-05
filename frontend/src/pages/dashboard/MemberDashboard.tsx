import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckSquare, AlertTriangle, Clock, TrendingUp, Plus, RefreshCw, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { dashboardService } from '@/services';
import type { MemberDashboard as TMemberDashboard } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { StatCard, Card, ErrorState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts';
import { Link, useNavigate } from 'react-router-dom';
import { TaskCard } from '@/components/task/TaskCard';
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome back, {user?.firstName}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your personal task overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={load} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><CheckSquare size={16} className="text-teal-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats.assignedTasks}</span>
            <p className="text-xs text-slate-500">Assigned</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><Clock size={16} className="text-amber-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats.inProgressTasks}</span>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><Clock size={16} className="text-blue-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats.pendingTasks}</span>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><TrendingUp size={16} className="text-emerald-600" /></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">{data.stats.completedTasks}</span>
              <span className="bg-lime-300 text-xs px-1.5 py-0.5 rounded font-medium">{data.stats.completionRate}% rate</span>
            </div>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><AlertTriangle size={16} className="text-red-600" /></div>
          <div>
            <span className="font-bold text-lg">{data.stats.overdueTasks}</span>
            <p className="text-xs text-slate-500">Overdue</p>
          </div>
        </div>
        <div className="bg-white/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm border border-white/40">
          <div className="bg-white p-2 rounded-xl"><TrendingUp size={16} className="text-purple-600" /></div>
          <div>
            <span className="font-bold text-lg">{(data.stats?.completionRate ?? 0).toFixed(0)}%</span>
            <p className="text-xs text-slate-500">Completion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-sm text-slate-700">My Tasks by Status</h2>
            <div className="flex space-x-2">
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><MoreHorizontal size={14} /></button>
              <button className="p-1.5 bg-white/60 rounded-full hover:bg-white"><ArrowUpRight size={14} /></button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.tasksByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {Array.isArray(data.tasksByStatus) && data.tasksByStatus.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#14b8a6'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3">
            {Array.isArray(data.tasksByStatus) && data.tasksByStatus.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: STATUS_COLORS[s.status] ?? '#14b8a6' }}
                />
                <span className="truncate">{s.status.replace(/_/g, ' ')}</span>
                <span className="ml-auto font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-sm text-slate-700">Upcoming Deadlines</h2>
            <Link to="/my-tasks" className="text-xs text-teal-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {data.upcomingDeadlines.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No upcoming deadlines.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.upcomingDeadlines.slice(0, 4).map((d, i) => (
                <Link
                  key={i}
                  to={`/tasks/${d.taskId}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/30 hover:bg-white/50 border border-white/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {d.priority.replace(/_/g, ' ')} · {d.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold shrink-0 ml-3 ${
                      d.daysLeft <= 1
                        ? 'text-red-600'
                        : d.daysLeft <= 3
                          ? 'text-orange-500'
                          : 'text-slate-500'
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
      </div>

      <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-sm text-slate-700">Recent Activity</h2>
          <Link to="/my-tasks" className="text-xs text-teal-600 hover:underline font-medium flex items-center gap-1">
            View tasks <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {!data.recentActivity || data.recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No recent activity.</p>
          ) : (
            data.recentActivity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm p-3 rounded-2xl bg-white/30 border border-white/40">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 text-teal-700">
                  {a.action.includes('CREATED') ? '✨' : a.action.includes('STATUS') ? '🔄' : '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700">
                    <span className="text-slate-500">{a.action.replace(/_/g, ' ').toLowerCase()}</span>
                    {a.taskTitle && (
                      <>
                        {' '}
                        on{' '}
                        <Link to={`/tasks/${a.taskId}`} className="text-teal-600 hover:underline font-medium">
                          {a.taskTitle}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
