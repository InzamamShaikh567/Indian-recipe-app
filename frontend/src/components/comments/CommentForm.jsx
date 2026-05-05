import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import './CommentForm.css';

const CommentForm = ({ onSubmit, onCancel, placeholder = 'Write a comment...', initialValue = '', autoFocus = false }) => {
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const MAX_LENGTH = 1000;

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const remainingChars = MAX_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className="comment-form-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={MAX_LENGTH + 100}
      />
      <div className="comment-form-footer">
        <span className={`comment-form-char-count ${isOverLimit ? 'over-limit' : ''}`}>
          {content.length}/{MAX_LENGTH}
        </span>
        <div className="comment-form-actions">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isOverLimit || submitting}
          >
            {submitting ? 'Posting...' : 'Comment'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
