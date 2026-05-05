import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const FollowButton = ({ userId }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token || user?.id === parseInt(userId)) {
      setLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}/is-following`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [userId, token, isAuthenticated, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) return;

    try {
      if (isFollowing) {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}/follow`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setIsFollowing(false);
        }
      } else {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}/follow`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading || !isAuthenticated || user?.id === parseInt(userId)) {
    return null;
  }

  return (
    <button
      className={`follow-btn ${isFollowing ? 'follow-btn-following' : ''}`}
      onClick={handleFollow}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
