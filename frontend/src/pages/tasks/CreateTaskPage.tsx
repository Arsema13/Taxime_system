import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, ChevronRight, Users, X } from 'lucide-react';
import { taskService, userService, teamService } from '@/services';
import type { TaskPriority, User } from '@/types';
import type { Team } from '@/types/department.types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/contexts';
import { Avatar } from '@/components/ui/Avatar';

interface CreateTaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: string;
  teamId: string;
  assigneeIds: string[];
}

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [form, setForm] = useState<CreateTaskForm>({
    title: '', description: '', priority: 'MEDIUM',
    dueDate: '', estimatedHours: '', teamId: '',
    assigneeIds: [],
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      teamService.getTeams({ page: 1, limit: 100, isActive: true }),
      userService.getUsers({ page: 1, limit: 100 }),
    ]).then(([teamsRes, usersRes]) => {
      setTeams(Array.isArray(teamsRes) ? teamsRes : teamsRes.data ?? []);
      setAllUsers(usersRes.data ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.teamId) {
      setExpandedTeams(new Set([form.teamId]));
    }
  }, [form.teamId]);

  const { teamedUsers, unassignedUsers, teamMap } = useMemo(() => {
    const map = new Map<string, User[]>();
    const byId = new Map<string, Team>();
    for (const t of teams) byId.set(t.id, t);
    for (const u of allUsers) {
      if (u.role === 'ADMIN') continue;
      const tid = u.teamId || '';
      if (tid && byId.has(tid)) {
        if (!map.has(tid)) map.set(tid, []);
        map.get(tid)!.push(u);
      }
    }
    return {
      teamedUsers: map,
      unassignedUsers: allUsers.filter(u => u.role !== 'ADMIN' && (!u.teamId || !byId.has(u.teamId))),
      teamMap: byId,
    };
  }, [teams, allUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      error('Validation', 'Title is required');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate + 'T00:00:00.000Z').toISOString() : undefined,
        estimatedHours: form.estimatedHours && Number(form.estimatedHours) > 0 ? Number(form.estimatedHours) : undefined,
        teamId: form.teamId || undefined,
        assigneeIds: form.assigneeIds.length > 0 ? form.assigneeIds : undefined,
      };
      const created = await taskService.createTask(payload);
      success('Created', 'Task created successfully');
      navigate(`/tasks/${created.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Could not create task';
      error('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setForm(f => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(userId)
        ? f.assigneeIds.filter(id => id !== userId)
        : [...f.assigneeIds, userId],
    }));
  };

  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const selectedUsers = useMemo(() => {
    return allUsers.filter(u => form.assigneeIds.includes(u.id));
  }, [allUsers, form.assigneeIds]);

  const activeTeamIds = useMemo(() => {
    if (form.teamId) return [form.teamId];
    return Array.from(teamedUsers.keys());
  }, [form.teamId, teamedUsers]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Tasks', to: '/tasks' }, { label: 'New Task' }]}
        actions={
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card padding="lg">
              <h2 className="text-lg font-bold text-[#0B1628] dark:text-slate-100 mb-4">Basic Information</h2>
              <div className="flex flex-col gap-4">
                <Input
                  label="Title"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Enter task title"
                />
                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the task..."
                  rows={5}
                />
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-bold text-[#0B1628] dark:text-slate-100 mb-4">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  required
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </Select>

                <Input
                  type="date"
                  label="Due Date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
                <Input
                  type="number"
                  label="Estimated Hours"
                  value={form.estimatedHours}
                  onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar: Assignees */}
          <div className="flex flex-col gap-6">
            <Card padding="lg">
              <h2 className="text-lg font-bold text-[#0B1628] dark:text-slate-100 mb-1">Assignees</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {form.assigneeIds.length} selected
              </p>

              {form.teamId && (
                <div className="mb-3">
                  <Select
                    label="Filter by team"
                    value={form.teamId}
                    onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                  >
                    <option value="">All teams</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-1 max-h-[32rem] overflow-y-auto">
                {activeTeamIds.map(teamId => {
                  const team = teamMap.get(teamId);
                  const members = teamedUsers.get(teamId) || [];
                  if (members.length === 0) return null;
                  const isExpanded = expandedTeams.has(teamId);
                  const selectedCount = members.filter(m => form.assigneeIds.includes(m.id)).length;

                  return (
                    <div key={teamId} className="rounded-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleTeamExpand(teamId)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <Users className="w-4 h-4 text-[#e89b1a]" />
                        <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{team?.name || 'Team'}</span>
                        {selectedCount > 0 && (
                          <span className="text-xs bg-[#e89b1a]/10 text-[#e89b1a] px-1.5 py-0.5 rounded-full font-medium">{selectedCount}</span>
                        )}
                      </button>
                      {isExpanded && (
                        <div className="flex flex-col">
                          {members.map(user => (
                            <label key={user.id} className="flex items-center gap-3 pl-9 pr-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={form.assigneeIds.includes(user.id)}
                                onChange={() => toggleAssignee(user.id)}
                                className="w-4 h-4 text-[#e89b1a] rounded border-slate-300 focus:ring-2 focus:ring-[#e89b1a]"
                              />
                              <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-slate-400 truncate">{user.position || user.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {unassignedUsers.length > 0 && (
                  <div className="rounded-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleTeamExpand('__unassigned__')}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                    >
                      {expandedTeams.has('__unassigned__') ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">No Team</span>
                      {unassignedUsers.filter(u => form.assigneeIds.includes(u.id)).length > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
                          {unassignedUsers.filter(u => form.assigneeIds.includes(u.id)).length}
                        </span>
                      )}
                    </button>
                    {expandedTeams.has('__unassigned__') && (
                      <div className="flex flex-col">
                        {unassignedUsers.map(user => (
                          <label key={user.id} className="flex items-center gap-3 pl-9 pr-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={form.assigneeIds.includes(user.id)}
                              onChange={() => toggleAssignee(user.id)}
                              className="w-4 h-4 text-[#e89b1a] rounded border-slate-300 focus:ring-2 focus:ring-[#e89b1a]"
                            />
                            <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-slate-400 truncate">{user.position || user.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTeamIds.length === 0 && unassignedUsers.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No users available.</p>
                )}
              </div>
            </Card>

            <div className="sticky top-6 flex flex-col gap-3">
              <Button type="submit" icon={<Save className="w-4 h-4" />} loading={loading} fullWidth>
                Create Task
              </Button>
              <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
