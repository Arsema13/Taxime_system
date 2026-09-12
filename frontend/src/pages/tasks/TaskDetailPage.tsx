import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Star, Calendar, Clock, User, Users,
  Paperclip, MessageSquare, Activity, CheckSquare,
  Download, Eye, X, FileText, Image, Film, Music, File,
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
import api from '@/services/api';
import { format, formatDistanceToNow } from 'date-fns';

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
  const [previewAtt, setPreviewAtt] = useState<Attachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true); setError(false);
    try {
      const t = await taskService.getTask(id);
      setTask(t);
      const [c, a, act] = await Promise.allSettled([
        taskService.getComments(id).catch(() => []),
        taskService.getAttachments(id).catch(() => []),
        taskService.getActivity(id).catch(() => []),
      ]);
      setComments(c.status === 'fulfilled' ? c.value : []);
      setAttachments(a.status === 'fulfilled' ? a.value : []);
      setActivity(act.status === 'fulfilled' ? act.value : []);
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Film className="w-5 h-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const isPreviewable = (mimeType: string) => {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf' || mimeType.startsWith('video/') || mimeType.startsWith('audio/') || mimeType === 'text/plain' || mimeType === 'text/html' || mimeType === 'text/css' || mimeType === 'text/javascript' || mimeType === 'application/json';
  };

  const handleDownload = async (att: Attachment) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/attachments/${att.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toastError('Error', 'Could not download file');
    }
  };

  const handlePreview = async (att: Attachment) => {
    setPreviewAtt(att);
    setPreviewLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/attachments/${att.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Preview failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      toastError('Error', 'Could not load preview');
      setPreviewAtt(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewAtt(null);
    setPreviewUrl(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{task.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>

            {task.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Progress</h3>
              <TaskProgress progress={task.progress} size="md" />
            </div>

            {/* Workflow actions */}
            <TaskWorkflowActions task={task} onAction={handleWorkflowAction} loading={actionLoading} />
          </Card>

          {/* Subtasks */}
          {(task.subtasks.length > 0 || true) && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
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

          {/* Tabs: Comments, Attachments */}
          <Card padding="none">
            <Tabs defaultValue="comments">
              <div className="border-b border-slate-200 dark:border-slate-700 px-6 pt-5">
                <TabList>
                  <TabTrigger value="comments" icon={<MessageSquare className="w-4 h-4" />}>
                    Comments ({comments.length})
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

                <TabContent value="attachments">
                  {attachments.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No attachments yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            {getFileIcon(att.mimeType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{att.originalName}</p>
                            <p className="text-xs text-slate-400">
                              {formatFileSize(att.size)} · {att.uploader.firstName} {att.uploader.lastName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isPreviewable(att.mimeType) && (
                              <button
                                onClick={() => handlePreview(att)}
                                className="p-2 rounded-lg text-slate-400 hover:text-[#e89b1a] hover:bg-[#e89b1a]/10 transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownload(att)}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
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
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Details</h3>
            <div className="flex flex-col gap-3 text-sm">
              {task.assignees && task.assignees.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Assigned to</p>
                    {assignees.length <= 3 ? (
                      <div className="flex flex-col gap-1">
                        {task.assignees.map((a) => (
                          <div key={a.id} className="flex items-center gap-2">
                            <Avatar src={a.user.avatar} name={`${a.user.firstName} ${a.user.lastName}`} size="xs" />
                            <span className="text-slate-700 dark:text-slate-300">{a.user.firstName} {a.user.lastName}</span>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">Created by</p>
                    <p className="text-slate-700 dark:text-slate-300">{task.creator.firstName} {task.creator.lastName}</p>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Due date</p>
                    <p className="text-slate-700 dark:text-slate-300">{format(new Date(task.dueDate), 'PPP')}</p>
                  </div>
                </div>
              )}

              {task.estimatedHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Estimated</p>
                    <p className="text-slate-700 dark:text-slate-300">{task.estimatedHours}h</p>
                  </div>
                </div>
              )}

              {task.team && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Team</p>
                    <p className="text-slate-700 dark:text-slate-300">{task.team.name}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#e89b1a]" />
              Audits
            </h3>
            <div className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-400">Created:</span>
                <span>{format(new Date(task.createdAt), 'PPpp')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-400">Updated:</span>
                <span>{format(new Date(task.updatedAt), 'PPpp')}</span>
              </div>
              {task.completedAt && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Completed:</span>
                  <span>{format(new Date(task.completedAt), 'PPpp')}</span>
                </div>
              )}
            </div>
            {activity.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Recent Activity</h4>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {activity.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e89b1a] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-600 dark:text-slate-400">
                          {a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System'}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 mx-1">·</span>
                        <span className="text-slate-500 dark:text-slate-400">{a.action}</span>
                        {a.taskTitle && (
                          <span className="text-slate-400 dark:text-slate-500 ml-1">"{a.taskTitle}"</span>
                        )}
                        <div className="text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* File Preview Modal */}
      {previewAtt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePreview} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  {getFileIcon(previewAtt.mimeType)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{previewAtt.originalName}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(previewAtt.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(previewAtt)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={closePreview} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
              {previewLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e89b1a]" />
              ) : previewUrl ? (
                previewAtt.mimeType.startsWith('image/') ? (
                  <img src={previewUrl} alt={previewAtt.originalName} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                ) : previewAtt.mimeType === 'application/pdf' ? (
                  <iframe src={previewUrl} className="w-full h-[70vh] rounded-lg border border-slate-200 dark:border-slate-700" title={previewAtt.originalName} />
                ) : previewAtt.mimeType.startsWith('video/') ? (
                  <video src={previewUrl} controls className="max-w-full max-h-[70vh] rounded-lg">
                    Your browser does not support video playback.
                  </video>
                ) : previewAtt.mimeType.startsWith('audio/') ? (
                  <audio src={previewUrl} controls className="w-full max-w-md" />
                ) : previewAtt.mimeType.startsWith('text/') || previewAtt.mimeType === 'application/json' ? (
                  <iframe src={previewUrl} className="w-full h-[70vh] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" title={previewAtt.originalName} />
                ) : (
                  <div className="text-center py-8">
                    <File className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Preview not available for this file type</p>
                    <Button size="sm" className="mt-3" onClick={() => handleDownload(previewAtt)} icon={<Download className="w-4 h-4" />}>
                      Download to view
                    </Button>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
