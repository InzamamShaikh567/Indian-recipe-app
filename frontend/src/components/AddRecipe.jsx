import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaUtensils, FaArrowLeft, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import './AddRecipe.css';

const AddRecipe = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    instructions: '',
    category: 'breakfast',
    type: 'veg',
    difficulty: 'easy',
    time_required: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/');
      } else {
        const error = await response.json();
        console.error('Error adding recipe:', error);
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="add-recipe-auth-required">
        <div className="auth-required-content">
          <FaLock className="auth-lock-icon" />
          <h2>Login Required</h2>
          <p>You need to be logged in to add a recipe.</p>
          <Button onClick={onOpenAuthModal}>Login or Register</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-recipe">
      <div className="add-recipe-header">
        <div className="add-recipe-back">
          <Button variant="primary" size="sm" onClick={() => navigate('/')}>
            <FaArrowLeft />
            Back to Home
          </Button>
        </div>
        <div className="add-recipe-title">
          <FaUtensils className="add-recipe-icon" />
          <h1>Add New Recipe</h1>
        </div>
        <p className="add-recipe-subtitle">Share your culinary creation with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="add-recipe-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Recipe Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
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
              value={formData.time_required}
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
            value={formData.description}
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
            value={formData.ingredients}
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
            value={formData.instructions}
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
              value={formData.category}
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
              value={formData.type}
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
              value={formData.difficulty}
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
            value={formData.image_url}
            onChange={handleChange}
            required
            placeholder="https://example.com/recipe-image.jpg"
          />
        </div>

        <div className="add-recipe-actions">
          <Button
            type="submit"
            loading={loading}
            className="add-recipe-submit"
          >
            <FaUtensils />
            {loading ? 'Adding Recipe...' : 'Add Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;
