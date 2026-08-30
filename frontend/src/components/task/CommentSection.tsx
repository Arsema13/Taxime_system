import React, { useState } from 'react';
import { Send, Pencil, Trash2, CornerDownRight } from 'lucide-react';
import type { Comment } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  comments: Comment[];
  onAdd: (content: string, parentId?: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function CommentItem({
  comment, depth = 0, onAdd, onEdit, onDelete, currentUserId,
}: {
  comment: Comment;
  depth?: number;
  onAdd: (content: string, parentId?: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentUserId: string;
}) {
  const [replying, setReplying] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [text,     setText]     = useState(comment.content);
  const [reply,    setReply]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const isOwn = comment.authorId === currentUserId;

  const submitEdit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try { await onEdit(comment.id, text.trim()); setEditing(false); } finally { setBusy(false); }
  };

  const submitReply = async () => {
    if (!reply.trim()) return;
    setBusy(true);
    try { await onAdd(reply.trim(), comment.id); setReply(''); setReplying(false); } finally { setBusy(false); }
  };

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''}>
      <div className="flex gap-3 group">
        <Avatar src={comment.author.avatar} name={`${comment.author.firstName} ${comment.author.lastName}`} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-800">
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && <span className="text-xs text-slate-400">(edited)</span>}
          </div>

          {editing ? (
            <div className="flex gap-2 mt-1">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button size="xs" loading={busy} onClick={submitEdit}>Save</Button>
              <Button size="xs" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
          )}

          <div className="flex items-center gap-3 mt-1">
            {depth === 0 && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-teal-600 transition-colors"
              >
                <CornerDownRight className="w-3 h-3" /> Reply
              </button>
            )}
            {isOwn && !editing && (
              <>
                <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => onDelete(comment.id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </>
            )}
          </div>

          {replying && (
            <div className="flex gap-2 mt-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitReply()}
                placeholder="Write a reply…"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button size="xs" loading={busy} onClick={submitReply} icon={<Send className="w-3 h-3" />}>Reply</Button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.map((r) => (
        <div key={r.id} className="mt-3">
          <CommentItem comment={r} depth={depth + 1} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} currentUserId={currentUserId} />
        </div>
      ))}
    </div>
  );
}

export function CommentSection({ comments, onAdd, onEdit, onDelete }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [busy,    setBusy]    = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setBusy(true);
    try { await onAdd(content.trim()); setContent(''); } finally { setBusy(false); }
  };

  const topLevel = comments.filter((c) => !c.parentId);

  return (
    <div className="flex flex-col gap-4">
      {/* New comment input */}
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Write a comment… (Enter to send)"
            className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
          />
          <Button size="sm" loading={busy} onClick={handleSubmit} icon={<Send className="w-4 h-4" />} disabled={!content.trim()}>
            Send
          </Button>
        </div>
      </div>

      {/* Comments */}
      <div className="flex flex-col gap-4">
        {topLevel.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No comments yet. Be the first!</p>
        ) : (
          topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={user?.id ?? ''}
            />
          ))
        )}
      </div>
    </div>
  );
}
