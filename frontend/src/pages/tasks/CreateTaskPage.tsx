import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { taskService, departmentService, userService } from '@/services';
import type { TaskCategory, TaskPriority, User, Department, Team } from '@/types';
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
  category: TaskCategory;
  dueDate: string;
  estimatedHours: string;
  departmentId: string;
  teamId: string;
  assigneeIds: string[];
  tags: string[];
  subtasks: string[];
}

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [form, setForm] = useState<CreateTaskForm>({
    title: '', description: '', priority: 'MEDIUM', category: 'TASK',
    dueDate: '', estimatedHours: '', departmentId: '', teamId: '',
    assigneeIds: [], tags: [], subtasks: []
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');

  useEffect(() => {
    Promise.all([
      departmentService.getDepartments({ page: 1, limit: 100 }).then(r => setDepartments(r.data)),
      userService.getUsers({ page: 1, limit: 100 }).then(r => setUsers(r.data)),
    ]);
  }, []);

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
        category: form.category,
        dueDate: form.dueDate || undefined,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
        departmentId: form.departmentId || undefined,
        teamId: form.teamId || undefined,
        assigneeIds: form.assigneeIds.length > 0 ? form.assigneeIds : undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        subtasks: form.subtasks.length > 0 ? form.subtasks : undefined,
      };
      const created = await taskService.createTask(payload);
      success('Created', 'Task created successfully');
      navigate(`/tasks/${created.id}`);
    } catch {
      error('Error', 'Could not create task');
    } finally {
      setLoading(false);
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

  const addSubtask = () => {
    if (subtaskInput.trim() && !form.subtasks.includes(subtaskInput.trim())) {
      setForm(f => ({ ...f, subtasks: [...f.subtasks, subtaskInput.trim()] }));
      setSubtaskInput('');
    }
  };

  const removeSubtask = (sub: string) => {
    setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s !== sub) }));
  };

  const toggleAssignee = (userId: string) => {
    setForm(f => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(userId)
        ? f.assigneeIds.filter(id => id !== userId)
        : [...f.assigneeIds, userId]
    }));
  };

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

            <Card padding="lg">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Subtasks</h2>
              <div className="flex gap-2 mb-3">
                <Input
                  value={subtaskInput}
                  onChange={e => setSubtaskInput(e.target.value)}
                  placeholder="Add subtask..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button type="button" onClick={addSubtask} icon={<Plus className="w-4 h-4" />}>Add</Button>
              </div>
              {form.subtasks.length > 0 && (
                <div className="flex flex-col gap-2">
                  {form.subtasks.map((sub, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="flex-1 text-sm text-slate-700">{sub}</span>
                      <button type="button" onClick={() => removeSubtask(sub)} className="text-slate-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
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
