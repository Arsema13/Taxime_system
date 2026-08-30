import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import type { Subtask } from '@/types';
import { Button } from '@/components/ui/Button';
import { TaskProgress } from './TaskProgress';

interface Props {
  subtasks: Subtask[];
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  readonly?: boolean;
}

export function SubtaskList({ subtasks, onToggle, onAdd, onDelete, readonly = false }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const completed = subtasks.filter((s) => s.isCompleted).length;
  const total     = subtasks.length;
  const progress  = total ? Math.round((completed / total) * 100) : 0;

  const handleAdd = () => {
    const t = newTitle.trim();
    if (!t) return;
    onAdd(t);
    setNewTitle('');
  };

  return (
    <div className="flex flex-col gap-2">
      {total > 0 && (
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-slate-500 font-medium">{completed}/{total} completed</p>
          <div className="w-32">
            <TaskProgress progress={progress} size="sm" showLabel={false} />
          </div>
        </div>
      )}

      {subtasks.map((sub) => (
        <div
          key={sub.id}
          className="flex items-center gap-2 group"
        >
          <button
            onClick={() => !readonly && onToggle(sub.id, !sub.isCompleted)}
            className={[
              'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
              sub.isCompleted
                ? 'bg-teal-500 border-teal-500 text-white'
                : 'border-slate-300 hover:border-teal-400',
              readonly ? 'cursor-default' : 'cursor-pointer',
            ].join(' ')}
          >
            {sub.isCompleted && <Check className="w-3 h-3" />}
          </button>
          <span className={`flex-1 text-sm ${sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
            {sub.title}
          </span>
          {!readonly && (
            <button
              onClick={() => onDelete(sub.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}

      {!readonly && (
        <div className="flex gap-2 mt-1">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add a subtask…"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
          />
          <Button size="xs" variant="outline" icon={<Plus className="w-3.5 h-3.5" />} onClick={handleAdd}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
