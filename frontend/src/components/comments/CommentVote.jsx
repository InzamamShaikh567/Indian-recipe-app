import React, { useState, useCallback } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './CommentVote.css';

const CommentVote = ({ commentId, initialVote, upvotes = 0, downvotes = 0, onVote }) => {
  const [userVote, setUserVote] = useState(initialVote || null);
  const [loading, setLoading] = useState(false);

  const voteCount = Number(upvotes) - Number(downvotes);

  const handleVote = useCallback(async (voteType) => {
    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to vote');
        return;
      }

      const newVote = userVote === voteType ? null : voteType;

      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (response.ok) {
        setUserVote(newVote);
        if (onVote) onVote(commentId, newVote);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  }, [commentId, userVote, loading, onVote]);

  return (
    <div className="comment-vote">
      <button
        className={`vote-btn vote-up ${userVote === 'up' ? 'vote-active' : ''}`}
        onClick={() => handleVote('up')}
        disabled={loading}
        aria-label="Upvote"
      >
        <FaArrowUp />
      </button>
      {voteCount > 0 || voteCount < 0 ? (
        <span className={`vote-count ${voteCount > 0 ? 'vote-positive' : 'vote-negative'}`}>
          {voteCount}
        </span>
      ) : null}
      <button
        className={`vote-btn vote-down ${userVote === 'down' ? 'vote-active' : ''}`}
        onClick={() => handleVote('down')}
        disabled={loading}
        aria-label="Downvote"
      >
        <FaArrowDown />
      </button>
    </div>
  );
};

export default CommentVote;
