import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaHeart, FaFilter, FaTimes, FaSlidersH } from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import Hero from './layout/Hero';
import Card from './ui/Card';
import Rating from './ui/Rating';
import Button from './ui/Button';
import './Home.css';

const Home = ({ searchQuery: externalSearchQuery = '' }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [maxTime, setMaxTime] = useState('');
  const [categories, setCategories] = useState(['all']);
  const [types] = useState(['all', 'veg', 'non-veg']);
  const [difficulties, setDifficulties] = useState(['all', 'easy', 'medium', 'hard']);
  const sentinelRef = useRef(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSelectedCategory('all');
      setSelectedType('all');
      setSelectedDifficulty('all');
      setMaxTime('');
      fetchRecipes(1, false, externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    fetchRecipes(1, false);
  }, [selectedCategory, selectedType, selectedDifficulty, maxTime]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchRecipes(page + 1, true);
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipes?limit=1000');
      if (!response.ok) return;
      const data = await response.json();
      const cats = ['all', ...new Set((data.recipes || []).map(r => r.category))];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecipes = async (pageNum, isLoadMore = false, search = null) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
      });

      const searchTerm = search !== null ? search : externalSearchQuery;
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedType && selectedType !== 'all') params.append('type', selectedType);
      if (selectedDifficulty && selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (maxTime) params.append('maxTime', maxTime);

      const response = await fetch(`http://localhost:5000/api/recipes?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();

      if (isLoadMore) {
        setRecipes(prev => [...prev, ...(data.recipes || [])]);
      } else {
        setRecipes(data.recipes || []);
      }

      setHasMore(data.hasMore || false);
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

  const handleFavoriteToggle = (e, recipeId) => {
    e.stopPropagation();
    toggleFavorite(recipeId);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setMaxTime('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedType !== 'all' || selectedDifficulty !== 'all' || maxTime;

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner" />
        <p>Loading delicious recipes...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <Hero />

      <div className="home-content">
        <div className="home-header">
          <div className="home-title">
            <h1>Popular Indian Recipes</h1>
            <p>Discover authentic flavors from across India</p>
          </div>

          <div className="home-actions">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="home-filter-toggle"
            >
              {showFilters ? <FaTimes /> : <FaSlidersH />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={resetFilters} className="home-reset">
                Reset
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="home-filters">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="filter-options">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`filter-option ${selectedCategory === category ? 'filter-option-active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Type</label>
              <div className="filter-options">
                {types.map((type) => (
                  <button
                    key={type}
                    className={`filter-option ${selectedType === type ? 'filter-option-active' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Difficulty</label>
              <div className="filter-options">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    className={`filter-option ${selectedDifficulty === difficulty ? 'filter-option-active' : ''}`}
                    onClick={() => setSelectedDifficulty(difficulty)}
                  >
                    {difficulty === 'all' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Time</label>
              <input
                type="text"
                placeholder="e.g., 30 min"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="home-empty">
            <FaFilter className="home-empty-icon" />
            <h2>No recipes found</h2>
            <p>Try adjusting your filters or search query</p>
            <Button onClick={resetFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="home-grid">
            {recipes.map((recipe, index) => (
              <Card key={recipe.id} delay={index * 0.05} onClick={() => navigate(`/recipe/${recipe.id}`)}>
                <div className="recipe-card">
                  <div className="recipe-card-image-wrapper">
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="recipe-card-image"
                    />
                    <button
                      className={`recipe-card-heart ${isFavorite(recipe.id) ? 'recipe-card-heart-active' : ''}`}
                      onClick={(e) => handleFavoriteToggle(e, recipe.id)}
                      aria-label={isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <FaHeart />
                    </button>
                  </div>
                  <div className="recipe-card-content">
                    <h3 className="recipe-card-title">{recipe.name}</h3>
                    <div className="recipe-card-meta">
                      <span className="badge badge-primary">{recipe.category}</span>
                      <span className="badge badge-secondary">{recipe.type}</span>
                      <span className="badge badge-warning">{recipe.difficulty}</span>
                      <span className="badge badge-ghost">{recipe.time_required}</span>
                    </div>
                    <p className="recipe-card-description">
                      {recipe.description?.substring(0, 100)}...
                    </p>
                    {!recipe.is_default && recipe.author_name && !recipe.author_is_admin && (
                      <p className="recipe-card-author">
                        Made by {recipe.author_name}
                      </p>
                    )}
                    <div className="recipe-card-footer">
                      <Rating value={parseFloat(recipe.average_rating) || 0} readonly size="sm" />
                      <Link
                        to={`/recipe/${recipe.id}`}
                        className="recipe-card-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Recipe
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {hasMore && !loadingMore && (
          <div ref={sentinelRef} style={{ height: '20px', margin: '2rem 0' }} />
        )}

        {loadingMore && (
          <div className="home-loading">
            <div className="spinner" />
            <p>Loading more...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
