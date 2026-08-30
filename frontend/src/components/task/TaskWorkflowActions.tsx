import React, { useState } from 'react';
import { CheckCircle, XCircle, Play, Send, PauseCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import type { Task, TaskStatus } from '@/types';
import { useAuth } from '@/contexts';

interface Props {
  task: Task;
  onAction: (action: string, notes?: string) => Promise<void>;
  loading?: boolean;
}

type WorkflowAction = 'accept' | 'start' | 'submit' | 'approve' | 'reject' | 'hold' | 'cancel';

interface ActionConfig {
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'danger' | 'secondary' | 'outline';
  requiresNote: boolean;
  notePlaceholder?: string;
}

const ACTION_CONFIG: Record<WorkflowAction, ActionConfig> = {
  accept:  { label: 'Accept Task',       icon: <CheckCircle className="w-4 h-4" />, variant: 'primary',   requiresNote: false },
  start:   { label: 'Start Task',        icon: <Play className="w-4 h-4" />,        variant: 'primary',   requiresNote: false },
  submit:  { label: 'Submit for Review', icon: <Send className="w-4 h-4" />,        variant: 'primary',   requiresNote: false, notePlaceholder: 'Optional submission notes…' },
  approve: { label: 'Approve',           icon: <CheckCircle className="w-4 h-4" />, variant: 'success',   requiresNote: false, notePlaceholder: 'Optional approval notes…' },
  reject:  { label: 'Reject',            icon: <XCircle className="w-4 h-4" />,     variant: 'danger',    requiresNote: true,  notePlaceholder: 'Reason for rejection (required)…' },
  hold:    { label: 'Put On Hold',       icon: <PauseCircle className="w-4 h-4" />, variant: 'secondary', requiresNote: false, notePlaceholder: 'Reason for hold…' },
  cancel:  { label: 'Cancel Task',       icon: <Ban className="w-4 h-4" />,         variant: 'danger',    requiresNote: false, notePlaceholder: 'Reason for cancellation…' },
};

function getAllowedActions(status: TaskStatus, role: string): WorkflowAction[] {
  const isMember  = role === 'MEMBER';
  const canReview = role === 'COMMANDER' || role === 'TEAM_LEAD';

  switch (status) {
    case 'PENDING':              return isMember ? ['accept'] : [];
    case 'ACCEPTED':             return isMember ? ['start'] : [];
    case 'IN_PROGRESS':          return isMember ? ['submit', 'hold'] : canReview ? ['hold', 'cancel'] : [];
    case 'SUBMITTED_FOR_REVIEW': return canReview ? ['approve', 'reject'] : [];
    case 'UNDER_REVIEW':         return canReview ? ['approve', 'reject'] : [];
    case 'ON_HOLD':              return isMember ? ['start'] : canReview ? ['cancel'] : [];
    case 'REJECTED':             return isMember ? ['start'] : [];
    default: return [];
  }
}

export function TaskWorkflowActions({ task, onAction, loading = false }: Props) {
  const { user } = useAuth();
  const [modalAction, setModalAction] = useState<WorkflowAction | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const actions = getAllowedActions(task.status, user?.role ?? '');
  if (actions.length === 0) return null;

  const handleAction = async (action: WorkflowAction) => {
    const cfg = ACTION_CONFIG[action];
    if (cfg.requiresNote || cfg.notePlaceholder) {
      setModalAction(action);
      setNote('');
      return;
    }
    setSubmitting(true);
    try { await onAction(action); } finally { setSubmitting(false); }
  };

  const handleModalConfirm = async () => {
    if (!modalAction) return;
    const cfg = ACTION_CONFIG[modalAction];
    if (cfg.requiresNote && !note.trim()) return;
    setSubmitting(true);
    try {
      await onAction(modalAction, note.trim() || undefined);
      setModalAction(null);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const cfg = ACTION_CONFIG[action];
          return (
            <Button
              key={action}
              variant={cfg.variant}
              size="sm"
              icon={cfg.icon}
              loading={loading || submitting}
              onClick={() => handleAction(action)}
            >
              {cfg.label}
            </Button>
          );
        })}
      </div>

      {modalAction && (
        <Modal
          isOpen
          onClose={() => setModalAction(null)}
          title={ACTION_CONFIG[modalAction].label}
          size="sm"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModalAction(null)}>Cancel</Button>
              <Button
                variant={ACTION_CONFIG[modalAction].variant}
                size="sm"
                loading={submitting}
                disabled={ACTION_CONFIG[modalAction].requiresNote && !note.trim()}
                onClick={handleModalConfirm}
              >
                Confirm
              </Button>
            </>
          }
        >
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={ACTION_CONFIG[modalAction].notePlaceholder}
            rows={3}
            required={ACTION_CONFIG[modalAction].requiresNote}
          />
          {ACTION_CONFIG[modalAction].requiresNote && !note.trim() && (
            <p className="text-xs text-red-500 mt-1">This field is required.</p>
          )}
        </Modal>
      )}
    </>
  );
}
