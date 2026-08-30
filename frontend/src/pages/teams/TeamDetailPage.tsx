import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Crown } from 'lucide-react';
import { departmentService } from '@/services';
import type { Team, TeamMember } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';

export default function TeamDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [team,    setTeam]    = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([departmentService.getTeam(id), departmentService.getTeamMembers(id)])
      .then(([t, m]) => { setTeam(t); setMembers(m); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!team)   return <p className="text-center text-slate-500 py-20">Team not found.</p>;

  return (
    <div>
      <PageHeader
        title={team.name}
        description={team.description ?? undefined}
        breadcrumbs={[{ label: 'Teams', to: '/teams' }, { label: team.name }]}
        actions={<Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>}
      />

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Members ({members.length})</h3>
        </div>
        {members.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No members yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <Avatar src={m.user.avatar} name={`${m.user.firstName} ${m.user.lastName}`} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.user.firstName} {m.user.lastName}</p>
                    {team.leadId === m.userId && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{m.user.email}</p>
                  {m.user.position && <p className="text-xs text-slate-400 truncate">{m.user.position}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
