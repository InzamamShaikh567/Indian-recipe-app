import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import './CommentSection.css';

const CommentSection = ({ recipeId, onLoginClick }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipeAuthorId, setRecipeAuthorId] = useState(null);
  const { isAuthenticated, token } = useAuth();

  const fetchComments = useCallback(async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch recipe to get author_id
      const recipeResponse = await fetch(`http://localhost:5000/api/recipes/${recipeId}`);
      let authorId = null;
      if (recipeResponse.ok) {
        const recipe = await recipeResponse.json();
        authorId = recipe.author_id;
        setRecipeAuthorId(authorId);
      }

      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}/comments`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      // Add recipe_author_id to each comment for OP tag
      const commentsWithAuthor = data.map(comment => ({
        ...comment,
        recipe_author_id: authorId,
      }));
      setComments(commentsWithAuthor);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [recipeId, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (content, parentCommentId = null) => {
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          parent_comment_id: parentCommentId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      const newComment = await response.json();

      if (parentCommentId) {
        // Add reply to the correct parent comment
        setComments(prevComments => addReplyToComment(prevComments, parentCommentId, newComment));
      } else {
        // Add new top-level comment
        setComments(prev => [newComment, ...prev]);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(error.message);
    }
  };

  const addReplyToComment = (comments, parentId, reply) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [reply, ...(comment.replies || [])],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, reply),
        };
      }
      return comment;
    });
  };

  const handleVote = (commentId, newVote) => {
    // Update vote in the comments tree
    setComments(prevComments => updateCommentVote(prevComments, commentId, newVote));
  };

  const updateCommentVote = (comments, commentId, newVote) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        const oldVote = comment.user_vote;
        let { upvotes = 0, downvotes = 0 } = comment;

        // Remove old vote
        if (oldVote === 'up') upvotes--;
        if (oldVote === 'down') downvotes--;

        // Add new vote
        if (newVote === 'up') upvotes++;
        if (newVote === 'down') downvotes++;

        return { ...comment, user_vote: newVote, upvotes, downvotes };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentVote(comment.replies, commentId, newVote),
        };
      }
      return comment;
    });
  };

  const handleDelete = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      // Remove comment from the tree
      setComments(prev => removeCommentFromTree(prev, commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.message);
    }
  };

  const removeCommentFromTree = (comments, commentId) => {
    return comments.filter(comment => {
      if (comment.id === commentId) return false;
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = removeCommentFromTree(comment.replies, commentId);
      }
      return true;
    });
  };

  const handleReply = (parentCommentId, content) => {
    return handleSubmitComment(content, parentCommentId);
  };

  if (loading) {
    return (
      <div className="comment-section-loading">
        <div className="spinner" />
        <p>Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h2 className="comment-section-title">
        Comments ({comments.length})
      </h2>

      {isAuthenticated ? (
        <div className="comment-new">
          <CommentForm
            onSubmit={(content) => handleSubmitComment(content)}
            placeholder="Write a comment..."
          />
        </div>
      ) : (
        <div className="comment-login-prompt">
          <p>Please <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick?.(); }}>login</a> to post a comment.</p>
        </div>
      )}

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="comment-empty">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              recipeAuthorId={recipeAuthorId}
              onVote={handleVote}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
