import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Users, Calendar } from 'lucide-react';
import { userService } from '@/services';
import type { User, UserStats } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { format } from 'date-fns';

export default function EmployeeDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [user,    setUser]  = useState<User | null>(null);
  const [stats,   setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([userService.getUser(id), userService.getUserStats(id)])
      .then(([u, s]) => { setUser(u); setStats(s); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!user)   return <p className="text-center text-slate-500 py-20">Employee not found.</p>;

  return (
    <div>
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        breadcrumbs={[{ label: 'Employees', to: '/employees' }, { label: `${user.firstName} ${user.lastName}` }]}
        actions={<Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card p-6 flex flex-col items-center text-center gap-4">
          <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
            {user.position && <p className="text-slate-500 text-sm">{user.position}</p>}
            {user.rank    && <p className="text-slate-400 text-xs mt-0.5">{user.rank}</p>}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant={user.role === 'COMMANDER' ? 'primary' : user.role === 'TEAM_LEAD' ? 'purple' : 'default'}>
              {user.role.replace('_', ' ')}
            </Badge>
            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'} dot>
              {user.status}
            </Badge>
          </div>
          <div className="w-full border-t border-slate-100 pt-4 flex flex-col gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{user.email}</span>
            {user.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{user.phone}</span>}
            {user.department && <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" />{user.department.name}</span>}
            {user.team && <span className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{user.team.name}</span>}
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
            <StatCard label="Assigned" value={stats.totalAssigned} icon={<span className="text-2xl">📋</span>} iconBg="bg-blue-100" />
            <StatCard label="Completed" value={stats.totalCompleted} icon={<span className="text-2xl">✅</span>} iconBg="bg-emerald-100" />
            <StatCard label="Overdue" value={stats.totalOverdue} icon={<span className="text-2xl">⏰</span>} iconBg="bg-red-100" />
            <StatCard label="Completion Rate" value={`${stats.completionRate.toFixed(0)}%`} icon={<span className="text-2xl">📈</span>} iconBg="bg-teal-100" />
            {stats.avgCompletionTime != null && (
              <StatCard label="Avg. Completion" value={`${stats.avgCompletionTime.toFixed(1)}d`} icon={<span className="text-2xl">⚡</span>} iconBg="bg-purple-100" />
            )}
            {stats.tasksThisMonth != null && (
              <StatCard label="This Month" value={stats.tasksThisMonth} icon={<span className="text-2xl">📅</span>} iconBg="bg-orange-100" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
