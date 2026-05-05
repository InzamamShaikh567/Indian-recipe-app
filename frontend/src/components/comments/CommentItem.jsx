import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaReply, FaTrash, FaClock, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import CommentVote from './CommentVote';
import CommentForm from './CommentForm';
import './CommentItem.css';

const MAX_VISIBLE_REPLIES = 2;

const CommentItem = ({ comment, onVote, onReply, onDelete, recipeAuthorId }) => {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const isOwner = comment.user_id === recipeAuthorId;
  const isAdmin = !!user?.is_admin;
  const canDelete = (user?.id === comment.user_id) || isAdmin;

  const handleReply = async (content) => {
    await onReply(comment.id, content);
    setShowReplyForm(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const replies = comment.replies || [];
  const visibleReplies = showAllReplies ? replies : replies.slice(0, MAX_VISIBLE_REPLIES);
  const hiddenReplyCount = replies.length - MAX_VISIBLE_REPLIES;

  return (
    <div id={`comment-${comment.id}`} className="comment-item">
      <div className="comment-vote-wrapper">
        <CommentVote
          commentId={comment.id}
          initialVote={comment.user_vote}
          upvotes={comment.upvotes || 0}
          downvotes={comment.downvotes || 0}
          onVote={onVote}
        />
      </div>

      <div className="comment-content-wrapper">
        <div className="comment-header">
          {comment.author_name && !comment.author_is_admin ? (
            <Link to={`/user/${comment.user_id}`} className="comment-author">
              {comment.author_name}
            </Link>
          ) : (
            <span className="comment-author">{comment.author_name || 'Anonymous'}</span>
          )}
          <span className="comment-timestamp">
            <FaClock /> {formatDate(comment.created_at)}
          </span>
          {isOwner && <span className="comment-badge comment-badge-owner">OP</span>}
          {!!comment.author_is_admin && <span className="comment-badge comment-badge-admin">Admin</span>}
        </div>

        <div className="comment-body">
          {comment.content}
        </div>

        <div className="comment-actions">
          {isAuthenticated && (
            <button
              className="comment-action-btn"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <FaReply /> Reply
            </button>
          )}
          {canDelete && (
            <button
              className="comment-action-btn comment-action-delete"
              onClick={handleDelete}
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="comment-reply-form">
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.author_name || 'comment'}...`}
              autoFocus
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="comment-replies">
            {visibleReplies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onVote={onVote}
                onReply={onReply}
                onDelete={onDelete}
                recipeAuthorId={recipeAuthorId}
              />
            ))}

            {!showAllReplies && hiddenReplyCount > 0 && (
              <button
                className="comment-view-more-replies"
                onClick={() => setShowAllReplies(true)}
              >
                <FaChevronDown />
                View {hiddenReplyCount} more {hiddenReplyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {showAllReplies && replies.length > MAX_VISIBLE_REPLIES && (
              <button
                className="comment-view-more-replies"
                onClick={() => setShowAllReplies(false)}
              >
                <FaChevronDown style={{ transform: 'rotate(180deg)' }} />
                Hide replies
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
