import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaCircle, FaRegClock } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    hasMore,
    page,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications();

  const sentinelRef = useRef(null);

  useEffect(() => {
    fetchNotifications(1, false);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchNotifications(page + 1, true);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinel);

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, loading, page]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.recipe_id) {
      navigate(`/recipe/${notification.recipe_id}#comments`);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + '...';
  };

  const getNotificationText = (notification) => {
    const senderName = notification.sender_name || 'Someone';
    const recipeName = notification.recipe_name ? ` on ${notification.recipe_name}` : '';
    const commentContent = notification.comment_content && notification.comment_content.trim()
      ? `"${truncateText(notification.comment_content)}"`
      : '';

    switch (notification.type) {
      case 'comment_on_recipe':
        return commentContent
          ? `${senderName} commented with ${commentContent}${recipeName}`
          : `${senderName} commented on your recipe${recipeName}`;
      case 'reply_to_comment':
        return commentContent
          ? `${senderName} replied with ${commentContent}${recipeName}`
          : `${senderName} replied to your comment${recipeName}`;
      default:
        return `${senderName} interacted with your content`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button className="notifications-mark-all" onClick={markAllAsRead}>
            <FaCheck />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 && !loading ? (
        <div className="notifications-empty">
          <FaRegClock className="notifications-empty-icon" />
          <h2>No notifications yet</h2>
          <p>When someone comments on your recipes or replies to your comments, you'll see them here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.is_read ? 'notification-unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {!notification.is_read ? <FaCircle /> : <FaRegClock />}
              </div>
              <div className="notification-content">
                <p className="notification-text">
                  {getNotificationText(notification)}
                </p>
                <span className="notification-time">
                  {formatDate(notification.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div ref={sentinelRef} style={{ height: '20px', margin: '2rem 0' }} />
      )}

      {loading && (
        <div className="notifications-loading">Loading...</div>
      )}
    </div>
  );
};

export default Notifications;
