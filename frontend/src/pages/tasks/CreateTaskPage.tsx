import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, ChevronRight, Users, CheckSquare, Paperclip, X } from 'lucide-react';
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<File[]>([]);

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
      setExpandedSections(new Set([form.teamId]));
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
    if (!form.dueDate) {
      error('Validation', 'Due date is required');
      return;
    }
    if (form.assigneeIds.length === 0) {
      error('Validation', 'Please assign at least one member');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        dueDate: new Date(form.dueDate + 'T00:00:00.000Z').toISOString(),
        estimatedHours: form.estimatedHours && Number(form.estimatedHours) > 0 ? Number(form.estimatedHours) : undefined,
        teamId: form.teamId || undefined,
        assigneeIds: form.assigneeIds,
      };
      const created = await taskService.createTask(payload);
      // Upload attachments after task is created
      if (files.length > 0) {
        for (const file of files) {
          try {
            await taskService.uploadAttachment(created.id, file);
          } catch {
            // Individual file upload failure is non-blocking
          }
        }
      }
      success('Created', 'Task created successfully');
      navigate(`/tasks/${created.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Could not create task';
      error('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        error('File too large', `"${f.name}" exceeds the 5 MB limit`);
        continue;
      }
      valid.push(f);
    }
    setFiles(prev => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAssignee = (userId: string) => {
    setForm(f => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(userId)
        ? f.assigneeIds.filter(id => id !== userId)
        : [...f.assigneeIds, userId],
    }));
  };

  const toggleAllInTeam = (teamId: string) => {
    const members = teamedUsers.get(teamId) || [];
    const memberIds = members.map(m => m.id);
    const allSelected = memberIds.every(id => form.assigneeIds.includes(id));
    setForm(f => ({
      ...f,
      assigneeIds: allSelected
        ? f.assigneeIds.filter(id => !memberIds.includes(id))
        : [...new Set([...f.assigneeIds, ...memberIds])],
    }));
  };

  const toggleAllUnassigned = () => {
    const ids = unassignedUsers.map(u => u.id);
    const allSelected = ids.every(id => form.assigneeIds.includes(id));
    setForm(f => ({
      ...f,
      assigneeIds: allSelected
        ? f.assigneeIds.filter(id => !ids.includes(id))
        : [...new Set([...f.assigneeIds, ...ids])],
    }));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTeamSelectionState = (teamId: string) => {
    const members = teamedUsers.get(teamId) || [];
    if (members.length === 0) return 'none';
    const selectedCount = members.filter(m => form.assigneeIds.includes(m.id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === members.length) return 'all';
    return 'some';
  };

  const getUnassignedSelectionState = () => {
    if (unassignedUsers.length === 0) return 'none';
    const selectedCount = unassignedUsers.filter(u => form.assigneeIds.includes(u.id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === unassignedUsers.length) return 'all';
    return 'some';
  };

  const visibleTeams = form.teamId ? teams.filter(t => t.id === form.teamId) : teams;

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
                  required
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

            <Card padding="lg">
              <h2 className="text-lg font-bold text-[#0B1628] dark:text-slate-100 mb-4">Attachments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Optional. Max 5 MB per file.
              </p>
              <label className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-[#e89b1a] hover:bg-[#e89b1a]/5 transition-colors">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Click to attach files</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {files.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1 min-w-0">{f.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar: Assignees */}
          <div className="flex flex-col gap-6">
            <Card padding="lg">
              <h2 className="text-lg font-bold text-[#0B1628] dark:text-slate-100 mb-1">Assignees</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {form.assigneeIds.length} selected
              </p>

              <div className="mb-3">
                <Select
                  label="Team (optional)"
                  value={form.teamId}
                  onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                >
                  <option value="">All teams</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>

              <div className="flex flex-col gap-1 max-h-[32rem] overflow-y-auto">
                {unassignedUsers.length > 0 && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-600/50 overflow-hidden mb-1">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/30">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">No Team</span>
                      <button
                        type="button"
                        onClick={toggleAllUnassigned}
                        className="text-xs text-[#e89b1a] hover:text-[#d48a15] font-medium"
                      >
                        {getUnassignedSelectionState() === 'all' ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {unassignedUsers.map(user => (
                        <label key={user.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
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
                  </div>
                )}

                {visibleTeams.map(team => {
                  const members = teamedUsers.get(team.id) || [];
                  if (members.length === 0 && form.teamId) return null;
                  const isExpanded = expandedSections.has(team.id);
                  const selectionState = getTeamSelectionState(team.id);
                  const selectedCount = members.filter(m => form.assigneeIds.includes(m.id)).length;

                  return (
                    <div key={team.id} className="rounded-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/30">
                        <button type="button" onClick={() => toggleSection(team.id)} className="shrink-0">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        <Users className="w-4 h-4 text-[#e89b1a]" />
                        <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{team.name}</span>
                        {selectedCount > 0 && (
                          <span className="text-xs bg-[#e89b1a]/10 text-[#e89b1a] px-1.5 py-0.5 rounded-full font-medium">{selectedCount}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleAllInTeam(team.id)}
                          className="text-xs text-[#e89b1a] hover:text-[#d48a15] font-medium"
                        >
                          {selectionState === 'all' ? 'Deselect all' : 'Select all'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="flex flex-col">
                          {members.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">No members in this team</p>
                          ) : members.map(user => (
                            <label key={user.id} className="flex items-center gap-3 pl-10 pr-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
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

                {visibleTeams.length === 0 && unassignedUsers.length === 0 && (
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
