import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followingRecipes, setFollowingRecipes] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingLoadingMore, setFollowingLoadingMore] = useState(false);
  const [followingPage, setFollowingPage] = useState(1);
  const [followingHasMore, setFollowingHasMore] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    description: user?.description || '',
  });
  const sentinelRef = useRef(null);
  const followingSentinelRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      fetchUserRecipes(1, false);
      fetchFollowingFeed(1, false);
    }
  }, [user, token]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchUserRecipes(page + 1, true);
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
  }, [hasMore, loadingMore, loading, page]);

  useEffect(() => {
    const sentinel = followingSentinelRef.current;
    if (!sentinel || !followingHasMore || followingLoadingMore || followingLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && followingHasMore && !followingLoadingMore) {
          fetchFollowingFeed(followingPage + 1, true);
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
  }, [followingHasMore, followingLoadingMore, followingLoading, followingPage]);

  const fetchUserRecipes = async (pageNum, isLoadMore = false) => {
    if (!user || !token) return;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/me?page=${pageNum}&limit=6`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();

      if (isLoadMore) {
        setRecipes(prev => [...prev, ...data.recipes]);
      } else {
        setRecipes(data.recipes);
      }

      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchFollowingFeed = async (pageNum, isLoadMore = false) => {
    if (!user || !token) return;

    if (isLoadMore) {
      setFollowingLoadingMore(true);
    } else {
      setFollowingLoading(true);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/me/following-feed?page=${pageNum}&limit=12`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch following feed');
      }

      const data = await response.json();

      if (isLoadMore) {
        setFollowingRecipes(prev => [...prev, ...data.recipes]);
      } else {
        setFollowingRecipes(data.recipes);
      }

      setFollowingHasMore(data.hasMore);
      setFollowingPage(pageNum);
    } catch (error) {
      console.error('Error fetching following feed:', error);
    } finally {
      if (isLoadMore) {
        setFollowingLoadingMore(false);
      } else {
        setFollowingLoading(false);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData.fullName, profileData.description);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="profile-section">
          <h2>Profile</h2>

          {editing ? (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="profile-info">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Full Name:</strong> {user?.full_name || 'Not set'}</p>
                <p><strong>Description:</strong> {user?.description || 'Not set'}</p>
              </div>
              <button className="edit-profile-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="recipes-section">
          <h2>My Recipes ({recipes.length})</h2>

          {recipes.length === 0 ? (
            <p className="no-recipes">You haven't submitted any recipes yet.</p>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="recipe-card"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={recipe.image_url} alt={recipe.name} />
                  <div className="recipe-info">
                    <h3>{recipe.name}</h3>
                    <p className="recipe-category">{recipe.category}</p>
                    <div className="recipe-actions">
                      <button
                        className="edit-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(`/edit-recipe/${recipe.id}`); }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(recipe.id); }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && !loadingMore && (
            <div ref={sentinelRef} style={{ height: '20px', margin: '2rem 0' }} />
          )}

          {loadingMore && (
            <div className="dashboard-loading">Loading more...</div>
          )}
        </div>

        <div className="recipes-section">
          <h2>Following Feed ({followingRecipes.length})</h2>

          {followingLoading ? (
            <div className="dashboard-loading">Loading...</div>
          ) : followingRecipes.length === 0 ? (
            <p className="no-recipes">You're not following anyone yet. Follow users to see their recipes here!</p>
          ) : (
            <div className="recipes-grid">
              {followingRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="recipe-card"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={recipe.image_url} alt={recipe.name} />
                  <div className="recipe-info">
                    <h3>{recipe.name}</h3>
                    <p className="recipe-category">{recipe.category}</p>
                    {recipe.author_name && !recipe.author_is_admin && (
                      <p className="recipe-author">by {recipe.author_name}</p>
                    )}
                    <div className="recipe-actions">
                      <button
                        className="view-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(`/recipe/${recipe.id}`); }}
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {followingHasMore && !followingLoadingMore && (
            <div ref={followingSentinelRef} style={{ height: '20px', margin: '2rem 0' }} />
          )}

          {followingLoadingMore && (
            <div className="dashboard-loading">Loading more...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
