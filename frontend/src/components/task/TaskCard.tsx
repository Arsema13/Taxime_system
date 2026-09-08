import React from 'react';
import { Calendar, MessageSquare, Paperclip, Star, Clock } from 'lucide-react';
import type { Task } from '@/types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskProgress } from './TaskProgress';
import { AvatarGroup } from '@/components/ui/Avatar';
import { formatDistanceToNow, isAfter } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onFavorite?: () => void;
  compact?: boolean;
  draggable?: boolean;
}

function formatDueDate(date: string) {
  const d = new Date(date);
  const now = new Date();
  if (isAfter(now, d)) return { label: 'Overdue', className: 'text-red-600 dark:text-red-400' };
  const diff = formatDistanceToNow(d, { addSuffix: true });
  return { label: diff, className: 'text-slate-500 dark:text-slate-400' };
}

export function TaskCard({ task, onClick, onFavorite, compact = false, draggable = false }: TaskCardProps) {
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
  const assignees = task.assignees?.map((a) => ({
    name: `${a.user.firstName} ${a.user.lastName}`,
    avatar: a.user.avatar,
  })) ?? [];

  return (
    <div
      draggable={draggable}
      onClick={onClick}
      className={[
        'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-150 group',
        onClick ? 'cursor-pointer hover:shadow-md hover:border-[#e89b1a]/40 dark:hover:border-[#e89b1a]/40' : '',
        compact ? 'p-3' : 'p-4',
      ].join(' ')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
          className={[
            'shrink-0 transition-colors',
            task.isFavorite ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400',
          ].join(' ')}
        >
          <Star className="w-4 h-4" fill={task.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-1 line-clamp-2 group-hover:text-[#e89b1a] dark:group-hover:text-[#e89b1a] transition-colors ${compact ? 'text-sm' : 'text-sm'}`}>
        {task.title}
      </h3>

      {/* Description */}
      {!compact && task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Progress */}
      {!compact && (
        <div className="mb-3">
          <TaskProgress progress={task.progress} size="sm" showLabel />
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          {task._count?.comments !== undefined && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {task._count.comments}
            </span>
          )}
          {task._count?.attachments !== undefined && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              {task._count.attachments}
            </span>
          )}
          {dueInfo && (
            <span className={`flex items-center gap-1 ${dueInfo.className}`}>
              <Calendar className="w-3.5 h-3.5" />
              {dueInfo.label}
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {task.estimatedHours}h
            </span>
          )}
        </div>
        {assignees.length > 0 && <AvatarGroup users={assignees} max={3} size="xs" />}
      </div>
    </div>
  );
}
