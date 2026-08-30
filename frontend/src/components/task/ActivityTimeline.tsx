import React from 'react';
import type { ActivityLog } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistanceToNow, format } from 'date-fns';

interface Props {
  activities: ActivityLog[];
}

function getActivityIcon(action: string): string {
  if (action.includes('CREATED'))   return '✨';
  if (action.includes('ASSIGNED'))  return '👤';
  if (action.includes('STATUS'))    return '🔄';
  if (action.includes('PROGRESS'))  return '📈';
  if (action.includes('COMMENT'))   return '💬';
  if (action.includes('ATTACH'))    return '📎';
  if (action.includes('APPROVED'))  return '✅';
  if (action.includes('REJECTED'))  return '❌';
  if (action.includes('SUBMITTED')) return '📤';
  if (action.includes('ACCEPTED'))  return '👍';
  if (action.includes('STARTED'))   return '▶️';
  if (action.includes('COMPLETED')) return '🏁';
  if (action.includes('UPDATED'))   return '✏️';
  return '📋';
}

function formatAction(action: string, details?: Record<string, unknown> | null): string {
  const clean = action.replace(/_/g, ' ').toLowerCase();
  if (details?.from && details?.to) return `${clean}: ${details.from} → ${details.to}`;
  if (details?.progress)            return `progress updated to ${details.progress}%`;
  if (details?.message)             return String(details.message);
  return clean;
}

export function ActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">No activity yet.</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-200" />

      <div className="flex flex-col gap-4">
        {activities.map((a) => (
          <div key={a.id} className="relative flex gap-3 items-start group">
            {/* Dot */}
            <div className="absolute -left-4 w-4 h-4 rounded-full bg-white border-2 border-teal-400 flex items-center justify-center text-xs shrink-0 top-0.5">
              <span className="leading-none" style={{ fontSize: 9 }}>
                {getActivityIcon(a.action)}
              </span>
            </div>

            <Avatar src={a.user.avatar} name={`${a.user.firstName} ${a.user.lastName}`} size="xs" />

            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-snug">
                <span className="font-medium">{a.user.firstName} {a.user.lastName}</span>
                {' '}
                <span className="text-slate-500">{formatAction(a.action, a.details)}</span>
              </p>
              <time
                className="text-xs text-slate-400"
                title={format(new Date(a.createdAt), 'PPpp')}
              >
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
