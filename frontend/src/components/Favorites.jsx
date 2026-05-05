import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaHeart, FaUtensils, FaArrowLeft } from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './Favorites.css';

const Favorites = () => {
  const { favorites, isFavorite, toggleFavorite, loading } = useFavorites();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && favorites.length > 0) {
      gsap.fromTo(
        '.favorite-card',
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, [loading, favorites.length]);

  const handleFavoriteToggle = (e, recipeId) => {
    e.stopPropagation();
    toggleFavorite(recipeId);
  };

  if (!isAuthenticated) {
    return (
      <div className="favorites">
        <div className="favorites-header">
          <Link to="/" className="favorites-back">
            <Button variant="primary" size="sm">
              <FaArrowLeft />
              Back to Home
            </Button>
          </Link>
          <div className="favorites-title">
            <FaHeart className="favorites-title-icon" />
            <h1>My Favorites</h1>
          </div>
        </div>
        <div className="favorites-empty">
          <FaHeart className="favorites-empty-icon" />
          <h2>Login to view favorites</h2>
          <p>Your favorite recipes will appear here after you log in.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="spinner" />
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="favorites-header">
        <Link to="/" className="favorites-back">
          <Button variant="primary" size="sm">
            <FaArrowLeft />
            Back to Home
          </Button>
        </Link>
        <div className="favorites-title">
          <FaHeart className="favorites-title-icon" />
          <h1>My Favorites</h1>
        </div>
        <p className="favorites-subtitle">
          {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'} saved
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <FaHeart className="favorites-empty-icon" />
          <h2>No favorites yet</h2>
          <p>Start exploring and save your favorite recipes!</p>
          <Link to="/">
            <Button>
              <FaUtensils />
              Browse Recipes
            </Button>
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((recipe, index) => (
            <Card key={recipe.id ?? index} className="favorite-card" delay={index * 0.05}>
              <div className="favorite-card-image-wrapper">
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="favorite-card-image"
                />
                <button
                  className={`favorite-card-heart ${isFavorite(recipe.id) ? 'favorite-card-heart-active' : ''}`}
                  onClick={(e) => handleFavoriteToggle(e, recipe.id)}
                  aria-label="Remove from favorites"
                >
                  <FaHeart />
                </button>
              </div>
              <div className="favorite-card-content">
                <h3 className="favorite-card-title">{recipe.name}</h3>
                <div className="favorite-card-meta">
                  <span className="badge badge-primary">{recipe.category}</span>
                  <span className="badge badge-secondary">{recipe.type}</span>
                  <span className="badge badge-warning">{recipe.difficulty}</span>
                </div>
                <p className="favorite-card-description">
                  {recipe.description?.substring(0, 100)}...
                </p>
                {recipe.author_name && !recipe.author_is_admin && (
                  <p className="favorite-card-author">by {recipe.author_name}</p>
                )}
                {recipe.id && (
                  <Link to={`/recipe/${recipe.id}`} className="favorite-card-link">
                    View Recipe
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
