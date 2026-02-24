'use client';

import { useState } from 'react';

interface VoteButtonProps {
  parentType: 'feature' | 'roadmap';
  parentId: string;
  voteCount: number;
  userVoted: boolean;
  compact?: boolean;
}

export default function VoteButton({ parentType, parentId, voteCount: initialCount, userVoted: initialVoted, compact }: VoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;

    // Optimistic update
    const wasVoted = voted;
    setVoted(!wasVoted);
    setCount(c => wasVoted ? c - 1 : c + 1);
    setBusy(true);

    try {
      const r = await fetch('/api/admin/cc/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentType, parentId }),
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setVoted(data.voted);
    } catch {
      // Revert on failure
      setVoted(wasVoted);
      setCount(c => wasVoted ? c + 1 : c - 1);
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <button
        className={`cc-vote cc-vote--compact${voted ? ' cc-vote--active' : ''}`}
        onClick={toggle}
        title={voted ? 'Remove vote' : 'Upvote'}
      >
        <span className="cc-vote-arrow">&#9650;</span>
        <span className="cc-vote-count">{count}</span>
      </button>
    );
  }

  return (
    <button
      className={`cc-vote${voted ? ' cc-vote--active' : ''}`}
      onClick={toggle}
      title={voted ? 'Remove vote' : 'Upvote'}
    >
      <span className="cc-vote-arrow">&#9650;</span>
      <span className="cc-vote-count">{count}</span>
    </button>
  );
}
