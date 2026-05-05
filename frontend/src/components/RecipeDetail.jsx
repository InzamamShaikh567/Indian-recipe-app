import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaHeart, FaEdit, FaTrash, FaShare, FaClock, FaUtensils, FaFire, FaUser, FaLock, FaPrint } from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import Rating from './ui/Rating';
import Modal from './ui/Modal';
import Button from './ui/Button';
import AuthModal from './AuthModal';
import FollowButton from './FollowButton';
import CommentSection from './comments/CommentSection';
import './RecipeDetail.css';
import './FollowButton.css';

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, token, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
        const data = await response.json();
        setRecipe(data);
        setLoading(false);

        // Fetch average rating
        fetchAverageRating();
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (!loading && location.hash === '#comments') {
      const element = document.getElementById('comments');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [loading, location.hash]);

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${id}/average-rating`);
      const data = await response.json();
      setAverageRating(data.averageRating);
      setRatingCount(data.ratingCount);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleRatingSubmit = async (rating) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/recipes/${id}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      setUserRating(rating);
      fetchAverageRating();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const canEdit = isAuthenticated && (isAdmin || recipe?.author_id === user?.id);
  const canDelete = isAuthenticated && (isAdmin || recipe?.author_id === user?.id);
  const showAuthor = !recipe?.is_default && recipe?.author_name;

  const handleEdit = () => {
    navigate(`/edit-recipe/${id}`);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    });
  };

  const handleSocialShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(recipe?.name || 'Check out this recipe!');
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <div className="spinner" />
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-error">
        <h2>Recipe not found</h2>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-header">
        <div className="recipe-detail-image-wrapper">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="recipe-detail-image"
          />
          <button
            className={`recipe-detail-favorite ${isFavorite(recipe.id) ? 'recipe-detail-favorite-active' : ''}`}
            onClick={() => toggleFavorite(recipe.id)}
            aria-label={isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
        </div>

        <div className="recipe-detail-info">
          <div className="recipe-detail-meta">
            <span className="badge badge-primary">{recipe.category}</span>
            <span className="badge badge-secondary">{recipe.type}</span>
            <span className="badge badge-warning">{recipe.difficulty}</span>
          </div>

          <h1 className="recipe-detail-title">{recipe.name}</h1>

          {showAuthor && (
            <div className="recipe-detail-author">
              <FaUser className="recipe-detail-author-icon" />
              <span>Made by {recipe.author_name}</span>
              <FollowButton userId={recipe.author_id} />
            </div>
          )}

          <div className="recipe-detail-stats">
            <div className="recipe-detail-stat">
              <FaClock className="recipe-detail-stat-icon" />
              <span>{recipe.time_required}</span>
            </div>
            <div className="recipe-detail-stat">
              <FaFire className="recipe-detail-stat-icon" />
              <span>{recipe.difficulty}</span>
            </div>
            <div className="recipe-detail-stat">
              <FaUtensils className="recipe-detail-stat-icon" />
              <span>{recipe.type}</span>
            </div>
          </div>

          <div className="recipe-detail-rating">
            {isAuthenticated ? (
              <Rating
                value={userRating || averageRating}
                onChange={handleRatingSubmit}
                showValue
                size="lg"
              />
            ) : (
              <div className="recipe-detail-rating-locked">
                <Rating value={averageRating} readonly showValue size="lg" />
                <button
                  className="recipe-detail-rating-login"
                  onClick={() => setShowAuthModal(true)}
                >
                  <FaLock />
                  Login to rate
                </button>
              </div>
            )}
            {ratingCount > 0 && (
              <span className="recipe-detail-rating-count">
                ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
              </span>
            )}
          </div>

          <div className="recipe-detail-actions">
            {canEdit && (
              <Button onClick={handleEdit}>
                <FaEdit />
                Edit Recipe
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" onClick={handleDelete}>
                <FaTrash />
                Delete Recipe
              </Button>
            )}
            <Button variant="outline" onClick={handleShare}>
              <FaShare />
              Share
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <FaPrint />
              Print
            </Button>
          </div>
        </div>
      </div>

      <div className="recipe-detail-content">
        <div className="recipe-detail-section recipe-detail-section-full">
          <h2>About This Recipe</h2>
          <p>{recipe.description}</p>
        </div>

        <div className="recipe-detail-section recipe-detail-section-full">
          <h2>Ingredients</h2>
          <ul className="recipe-detail-list">
            {recipe.ingredients.split('\n').map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="recipe-detail-section">
          <h2>Instructions</h2>
          <ol className="recipe-detail-instructions">
            {recipe.instructions.split('\n').filter(inst => inst.trim()).map((instruction, index) => (
              <li key={index} className="recipe-step">
                <span className="recipe-step-number">{index + 1}</span>
                <span className="recipe-step-text">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div id="comments">
        <CommentSection recipeId={id} onLoginClick={() => setShowAuthModal(true)} />
      </div>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Recipe"
        size="sm"
      >
        <div className="share-modal-content">
          <p className="share-modal-text">Share this delicious recipe with others!</p>

          <Button onClick={handleCopyLink} className="share-modal-btn">
            Copy Link
          </Button>

          <div className="share-modal-social">
            <Button
              variant="outline"
              onClick={() => handleSocialShare('twitter')}
              className="share-modal-social-btn"
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('facebook')}
              className="share-modal-social-btn"
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('whatsapp')}
              className="share-modal-social-btn"
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </Modal>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default RecipeDetail;
