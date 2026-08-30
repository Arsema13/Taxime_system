import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  CheckSquare, AlertTriangle, Clock, TrendingUp,
  Users, Building2, Star, RefreshCw,
} from 'lucide-react';
import { dashboardService } from '@/services';
import type { CommanderDashboard as TCommanderDashboard } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { StatCard, Card, ErrorState } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { TaskProgress } from '@/components/task/TaskProgress';
import { TaskStatusBadge } from '@/components/task/TaskStatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const CHART_COLORS = ['#14b8a6','#6366f1','#f59e0b','#ef4444','#8b5cf6','#10b981','#3b82f6','#ec4899'];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94a3b8', PENDING: '#3b82f6', ACCEPTED: '#6366f1', IN_PROGRESS: '#f59e0b',
  SUBMITTED_FOR_REVIEW: '#8b5cf6', UNDER_REVIEW: '#a78bfa', COMPLETED: '#10b981',
  REJECTED: '#ef4444', ON_HOLD: '#64748b', CANCELLED: '#cbd5e1', OVERDUE: '#dc2626',
};

export default function CommanderDashboard() {
  const { user }  = useAuth();
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

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{greeting()}, {user?.firstName} 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your operations overview.</p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={data.stats?.totalTasks || 0}
          icon={<CheckSquare className="w-6 h-6 text-teal-600" />}
          iconBg="bg-teal-100"
        />
        <StatCard
          label="Completed"
          value={data.stats?.completedTasks || 0}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
          trend={{ value: data.stats?.completionRate || 0, label: 'rate', up: (data.stats?.completionRate || 0) >= 70 }}
        />
        <StatCard
          label="In Progress"
          value={data.stats?.inProgressTasks || 0}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          iconBg="bg-amber-100"
        />
        <StatCard
          label="Overdue"
          value={data.stats?.overdueTasks || 0}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          iconBg="bg-red-100"
        />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks by Status (donut) */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-800 mb-4">Tasks by Status</h3>
          {data.tasksByStatus && data.tasksByStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.tasksByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={2}
                  >
                    {data.tasksByStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, String(n).replace(/_/g, ' ')]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {safeSlice(data.tasksByStatus, 6).map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: STATUS_COLORS[s.status] ?? CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="truncate">{s.status.replace(/_/g,' ')}</span>
                    <span className="ml-auto font-semibold">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-slate-400 text-center py-12 text-sm">No data available</p>}
        </Card>

        {/* Tasks by Priority (bar) */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-800 mb-4">Tasks by Priority</h3>
          {data.tasksByPriority && data.tasksByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.tasksByPriority} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {data.tasksByPriority.map((entry, i) => {
                    const c = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };
                    return <Cell key={i} fill={c[entry.priority as keyof typeof c] ?? '#14b8a6'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-center py-12 text-sm">No data available</p>}
        </Card>

        {/* Department Performance */}
        <Card padding="lg">
          <h3 className="font-semibold text-slate-800 mb-4">Department Performance</h3>
          {data.departmentPerformance && data.departmentPerformance.length > 0 ? (
            <div className="flex flex-col gap-3">
              {safeSlice(data.departmentPerformance, 5).map((dept, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 truncate">{dept.name}</span>
                    <span className="text-slate-500 shrink-0 ml-2">{dept.completedTasks}/{dept.totalTasks}</span>
                  </div>
                  <TaskProgress progress={dept.completionRate} size="sm" showLabel />
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-center py-12 text-sm">No departments</p>}
        </Card>
      </div>

      {/* ── Recent Tasks ── */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Recent Tasks</h3>
          <Link to="/tasks" className="text-xs text-teal-600 hover:underline font-medium">View all</Link>
        </div>
        <div className="flex flex-col gap-2">
          {!data.recentTasks || data.recentTasks.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No recent tasks.</p>
          ) : (
            safeSlice(data.recentTasks, 8).map((task: any) => (
              <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {task.priority} · {task.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <TaskStatusBadge status={task.status} />
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
