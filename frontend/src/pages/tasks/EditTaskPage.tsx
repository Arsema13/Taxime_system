import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { taskService, departmentService, userService } from '@/services';
import type { Task, TaskCategory, TaskPriority, User, Department, Team } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, ErrorState } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/contexts';
import { Avatar } from '@/components/ui/Avatar';

interface EditTaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
  estimatedHours: string;
  departmentId: string;
  teamId: string;
  assigneeIds: string[];
  tags: string[];
}

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [form, setForm] = useState<EditTaskForm>({
    title: '', description: '', priority: 'MEDIUM', category: 'TASK',
    dueDate: '', estimatedHours: '', departmentId: '', teamId: '',
    assigneeIds: [], tags: []
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true); setLoadError(false);
      try {
        const [t, depts, usrs] = await Promise.all([
          taskService.getTask(id),
          departmentService.getDepartments({ page: 1, limit: 100 }).then(r => r.data),
          userService.getUsers({ page: 1, limit: 100 }).then(r => r.data),
        ]);
        setTask(t);
        setDepartments(depts);
        setUsers(usrs);
        setForm({
          title: t.title,
          description: t.description ?? '',
          priority: t.priority,
          category: t.category,
          dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
          estimatedHours: t.estimatedHours?.toString() ?? '',
          departmentId: t.departmentId ?? '',
          teamId: t.teamId ?? '',
          assigneeIds: t.assignees?.map(a => a.userId) ?? [],
          tags: t.tags?.map(tt => tt.tag.name) ?? [],
        });
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (form.departmentId) {
      departmentService.getTeams(form.departmentId, { page: 1, limit: 100 }).then(r => setTeams(r.data));
    } else {
      setTeams([]);
      setForm(f => ({ ...f, teamId: '' }));
    }
  }, [form.departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.title.trim()) {
      error('Validation', 'Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        category: form.category,
        dueDate: form.dueDate || undefined,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
        departmentId: form.departmentId || undefined,
        teamId: form.teamId || undefined,
        assigneeIds: form.assigneeIds.length > 0 ? form.assigneeIds : undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
      };
      await taskService.updateTask(id, payload);
      success('Updated', 'Task updated successfully');
      navigate(`/tasks/${id}`);
    } catch {
      error('Error', 'Could not update task');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const toggleAssignee = (userId: string) => {
    setForm(f => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(userId)
        ? f.assigneeIds.filter(id => id !== userId)
        : [...f.assigneeIds, userId]
    }));
  };

  if (loading) return <PageLoader />;
  if (loadError || !task) return <ErrorState message="Could not load task." onRetry={() => window.location.reload()} />;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Tasks', to: '/tasks' },
          { label: task.title, to: `/tasks/${id}` },
          { label: 'Edit' }
        ]}
        title="Edit Task"
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
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h2>
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
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Classification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </Select>

                <Select
                  label="Category"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as TaskCategory }))}
                >
                  <option value="TASK">Task</option>
                  <option value="BUG">Bug</option>
                  <option value="FEATURE">Feature</option>
                  <option value="IMPROVEMENT">Improvement</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="RESEARCH">Research</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="SUPPORT">Support</option>
                </Select>

                <Select
                  label="Department"
                  value={form.departmentId}
                  onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                >
                  <option value="">Select department</option>
                  {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>

                <Select
                  label="Team"
                  value={form.teamId}
                  onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                  disabled={!form.departmentId}
                >
                  <option value="">Select team</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Timeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Tags</h2>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} icon={<Plus className="w-4 h-4" />}>Add</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-md text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-teal-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Assignees</h2>
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {users.map(user => (
                  <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.assigneeIds.includes(user.id)}
                      onChange={() => toggleAssignee(user.id)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500"
                    />
                    <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            <div className="sticky top-6 flex flex-col gap-3">
              <Button type="submit" icon={<Save className="w-4 h-4" />} loading={saving} fullWidth>
                Save Changes
              </Button>
              <Button type="button" variant="outline" fullWidth onClick={() => navigate(`/tasks/${id}`)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
