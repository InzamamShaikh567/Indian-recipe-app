import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUtensils, FaArrowLeft, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import './AddRecipe.css';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user, isAdmin, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch recipe');
        const data = await response.json();
        setRecipe(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const recipeData = {
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        category: recipe.category,
        type: recipe.type,
        difficulty: recipe.difficulty,
        time_required: recipe.time_required,
        image_url: recipe.image_url
      };

      const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update recipe');
      }

      navigate(`/recipe/${id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canEdit = isAuthenticated && (isAdmin || recipe?.author_id === user?.id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="add-recipe">
        <div className="loading">
          <div className="spinner" />
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="add-recipe">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="add-recipe">
        <div className="error">Recipe not found</div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="add-recipe-auth-required">
        <div className="auth-required-content">
          <FaLock className="auth-lock-icon" />
          <h2>Access Denied</h2>
          <p>You don't have permission to edit this recipe.</p>
          <Button onClick={() => navigate(`/recipe/${id}`)}>Back to Recipe</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-recipe">
      <div className="add-recipe-header">
        <div className="add-recipe-back">
          <Button variant="primary" size="sm" onClick={() => navigate(`/recipe/${id}`)}>
            <FaArrowLeft />
            Back to Recipe
          </Button>
        </div>
        <div className="add-recipe-title">
          <FaUtensils className="add-recipe-icon" />
          <h1>Edit Recipe</h1>
        </div>
        <p className="add-recipe-subtitle">Update your culinary creation</p>
      </div>

      <form onSubmit={handleSubmit} className="add-recipe-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Recipe Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={recipe.name}
              onChange={handleChange}
              required
              placeholder="e.g., Butter Chicken"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time_required">Time Required *</label>
            <input
              type="text"
              id="time_required"
              name="time_required"
              value={recipe.time_required}
              onChange={handleChange}
              required
              placeholder="e.g., 45 minutes"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            required
            placeholder="Describe your recipe in a few sentences..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ingredients">Ingredients *</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            required
            placeholder="Enter each ingredient on a new line..."
            rows={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions *</label>
          <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            required
            placeholder="Enter each instruction step on a new line..."
            rows={6}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={recipe.category}
              onChange={handleChange}
              required
            >
              <option value="breakfast">Breakfast</option>
              <option value="snack">Snack</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="sweet">Sweet</option>
              <option value="beverage">Beverage</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={recipe.type}
              onChange={handleChange}
              required
            >
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty *</label>
            <select
              id="difficulty"
              name="difficulty"
              value={recipe.difficulty}
              onChange={handleChange}
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL *</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={recipe.image_url}
            onChange={handleChange}
            required
            placeholder="https://example.com/recipe-image.jpg"
          />
        </div>

        <div className="add-recipe-actions">
          <Button
            type="submit"
            loading={submitting}
            className="add-recipe-submit"
          >
            <FaUtensils />
            {submitting ? 'Updating...' : 'Update Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditRecipe;
