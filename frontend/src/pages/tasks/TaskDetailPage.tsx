import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Star, Calendar, Clock, User, Users,
  Building2, Tag, Paperclip, MessageSquare, Activity, CheckSquare,
} from 'lucide-react';
import { taskService } from '@/services';
import type { Task, Comment, Attachment, ActivityLog, Subtask } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskStatusBadge } from '@/components/task/TaskStatusBadge';
import { TaskPriorityBadge } from '@/components/task/TaskPriorityBadge';
import { TaskProgress } from '@/components/task/TaskProgress';
import { TaskWorkflowActions } from '@/components/task/TaskWorkflowActions';
import { SubtaskList } from '@/components/task/SubtaskList';
import { CommentSection } from '@/components/task/CommentSection';
import { ActivityTimeline } from '@/components/task/ActivityTimeline';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { Card, ErrorState } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/contexts';
import { format } from 'date-fns';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true); setError(false);
    try {
      const [t, c, a, act] = await Promise.all([
        taskService.getTask(id),
        taskService.getComments(id),
        taskService.getAttachments(id),
        taskService.getActivity(id),
      ]);
      setTask(t); setComments(c); setAttachments(a); setActivity(act);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleWorkflowAction = async (action: string, notes?: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      const actions: Record<string, () => Promise<Task>> = {
        accept: () => taskService.acceptTask(id),
        start: () => taskService.startTask(id),
        submit: () => taskService.submitTask(id, notes),
        approve: () => taskService.approveTask(id, notes),
        reject: () => taskService.rejectTask(id, notes ?? ''),
        hold: () => taskService.holdTask(id, notes),
        cancel: () => taskService.cancelTask(id, notes),
      };
      await actions[action]();
      success('Success', `Task ${action}ed successfully`);
      load();
    } catch { toastError('Error', `Could not ${action} task`); }
    finally { setActionLoading(false); }
  };

  const handleFavorite = async () => {
    if (!id) return;
    try {
      await taskService.toggleFavorite(id);
      success('Updated', 'Favorite toggled');
      load();
    } catch { toastError('Error', 'Could not toggle favorite'); }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await taskService.deleteTask(id);
      success('Deleted', 'Task deleted successfully');
      navigate('/tasks');
    } catch { toastError('Error', 'Could not delete task'); }
  };

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    if (!id) return;
    try {
      await taskService.updateSubtask(id, subtaskId, { isCompleted: completed });
      load();
    } catch { toastError('Error', 'Could not update subtask'); }
  };

  const handleSubtaskAdd = async (title: string) => {
    if (!id) return;
    try {
      await taskService.createSubtask(id, title);
      load();
    } catch { toastError('Error', 'Could not add subtask'); }
  };

  const handleSubtaskDelete = async (subtaskId: string) => {
    if (!id) return;
    try {
      await taskService.deleteSubtask(id, subtaskId);
      load();
    } catch { toastError('Error', 'Could not delete subtask'); }
  };

  const handleCommentAdd = async (content: string, parentId?: string) => {
    if (!id) return;
    await taskService.createComment(id, content, parentId);
    load();
  };

  const handleCommentEdit = async (commentId: string, content: string) => {
    if (!id) return;
    await taskService.updateComment(id, commentId, content);
    load();
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!id) return;
    await taskService.deleteComment(id, commentId);
    load();
  };

  if (loading) return <PageLoader />;
  if (error || !task) return <ErrorState message="Could not load task." onRetry={load} />;

  const assignees = task.assignees?.map((a) => ({
    name: `${a.user.firstName} ${a.user.lastName}`,
    avatar: a.user.avatar,
  })) ?? [];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Tasks', to: '/tasks' }, { label: task.title }]}
        title={task.title}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Star className="w-4 h-4" fill={task.isFavorite ? 'currentColor' : 'none'} />}
              onClick={handleFavorite}
            />
            <Button variant="outline" size="sm" icon={<Edit className="w-4 h-4" />} onClick={() => navigate(`/tasks/${id}/edit`)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Header */}
          <Card padding="lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{task.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                  <Badge variant="default">{task.category.replace(/_/g, ' ')}</Badge>
                  {task.tags?.map((t) => (
                    <Badge key={t.tag.id} variant="primary">{t.tag.name}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {task.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Progress</h3>
              <TaskProgress progress={task.progress} size="md" />
            </div>

            {/* Workflow actions */}
            <TaskWorkflowActions task={task} onAction={handleWorkflowAction} loading={actionLoading} />
          </Card>

          {/* Subtasks */}
          {(task.subtasks.length > 0 || true) && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Subtasks
              </h3>
              <SubtaskList
                subtasks={task.subtasks}
                onToggle={handleSubtaskToggle}
                onAdd={handleSubtaskAdd}
                onDelete={handleSubtaskDelete}
              />
            </Card>
          )}

          {/* Tabs: Comments, Activity */}
          <Card padding="none">
            <Tabs defaultValue="comments">
              <div className="border-b border-slate-200 px-6 pt-5">
                <TabList>
                  <TabTrigger value="comments" icon={<MessageSquare className="w-4 h-4" />}>
                    Comments ({comments.length})
                  </TabTrigger>
                  <TabTrigger value="activity" icon={<Activity className="w-4 h-4" />}>
                    Activity
                  </TabTrigger>
                  <TabTrigger value="attachments" icon={<Paperclip className="w-4 h-4" />}>
                    Attachments ({attachments.length})
                  </TabTrigger>
                </TabList>
              </div>

              <div className="p-6">
                <TabContent value="comments">
                  <CommentSection
                    comments={comments}
                    onAdd={handleCommentAdd}
                    onEdit={handleCommentEdit}
                    onDelete={handleCommentDelete}
                  />
                </TabContent>

                <TabContent value="activity">
                  <ActivityTimeline activities={activity} />
                </TabContent>

                <TabContent value="attachments">
                  {attachments.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No attachments yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                          <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{att.originalName}</p>
                            <p className="text-xs text-slate-400">
                              {(att.size / 1024).toFixed(1)} KB · {att.uploader.firstName} {att.uploader.lastName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Details</h3>
            <div className="flex flex-col gap-3 text-sm">
              {task.assignees && task.assignees.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-1">Assigned to</p>
                    {assignees.length <= 3 ? (
                      <div className="flex flex-col gap-1">
                        {task.assignees.map((a) => (
                          <div key={a.id} className="flex items-center gap-2">
                            <Avatar src={a.user.avatar} name={`${a.user.firstName} ${a.user.lastName}`} size="xs" />
                            <span className="text-slate-700">{a.user.firstName} {a.user.lastName}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <AvatarGroup users={assignees} max={5} />
                    )}
                  </div>
                </div>
              )}

              {task.creator && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Created by</p>
                    <p className="text-slate-700">{task.creator.firstName} {task.creator.lastName}</p>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Due date</p>
                    <p className="text-slate-700">{format(new Date(task.dueDate), 'PPP')}</p>
                  </div>
                </div>
              )}

              {task.estimatedHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Estimated</p>
                    <p className="text-slate-700">{task.estimatedHours}h</p>
                  </div>
                </div>
              )}

              {task.department && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="text-slate-700">{task.department.name}</p>
                  </div>
                </div>
              )}

              {task.team && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Team</p>
                    <p className="text-slate-700">{task.team.name}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Timestamps</h3>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div><span className="font-medium text-slate-600">Created:</span> {format(new Date(task.createdAt), 'PPpp')}</div>
              <div><span className="font-medium text-slate-600">Updated:</span> {format(new Date(task.updatedAt), 'PPpp')}</div>
              {task.completedAt && (
                <div><span className="font-medium text-slate-600">Completed:</span> {format(new Date(task.completedAt), 'PPpp')}</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
