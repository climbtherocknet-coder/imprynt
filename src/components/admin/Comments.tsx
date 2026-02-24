'use client';

import { useState, useEffect, useCallback } from 'react';

interface Comment {
  id: string;
  body: string;
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
  authorEmail: string;
  isAdmin: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Comments({
  parentType,
  parentId,
  accessLevel,
  currentUserId,
}: {
  parentType: 'feature' | 'roadmap' | 'changelog' | 'doc';
  parentId: string;
  accessLevel: 'admin' | 'advisory';
  currentUserId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/cc/comments?parentType=${parentType}&parentId=${parentId}`);
      if (r.ok) setComments(await r.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [parentType, parentId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/admin/cc/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentType, parentId, body: body.trim() }),
      });
      if (r.ok) {
        const c = await r.json();
        setComments(prev => [...prev, c]);
        setBody('');
      }
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const r = await fetch(`/api/admin/cc/comments?id=${id}`, { method: 'DELETE' });
      if (r.ok) setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      /* ignore */
    }
  };

  if (loading) return <p className="cc-comments-loading">Loading comments...</p>;

  return (
    <div className="cc-comments">
      <p className="cc-comments-label">Comments ({comments.length})</p>
      {comments.length === 0 && <p className="cc-comments-empty">No comments yet.</p>}
      {comments.map(c => (
        <div key={c.id} className="cc-comment">
          <div className="cc-comment-header">
            <span className="cc-comment-author">
              {c.authorFirstName || c.authorEmail?.split('@')[0] || 'User'}
              {c.isAdmin && <span className="cc-admin-badge">Admin</span>}
            </span>
            <span className="cc-comment-time">{timeAgo(c.createdAt)}</span>
            {(accessLevel === 'admin' || c.authorId === currentUserId) && (
              <button className="cc-comment-delete" onClick={() => remove(c.id)} title="Delete">
                &times;
              </button>
            )}
          </div>
          <p className="cc-comment-body">{c.body}</p>
        </div>
      ))}
      <div className="cc-comment-form">
        <textarea
          className="dash-textarea"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Add a comment... (Ctrl+Enter to post)"
          rows={2}
          style={{ minHeight: 48, fontSize: '0.8125rem' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
        <button
          className="dash-btn-primary"
          onClick={submit}
          disabled={submitting || !body.trim()}
          style={{ alignSelf: 'flex-end', marginTop: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
