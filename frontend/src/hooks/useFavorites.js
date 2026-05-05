import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useFavorites = () => {
  const { token, isAuthenticated } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setFavoriteRecipes([]);
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFavoriteRecipes(data || []);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token, isAuthenticated]);

  const addFavorite = async (recipeId) => {
    if (!token) return;

    // Optimistic update - add recipe to local state immediately
    // We'll refetch to get full recipe data, but also update locally
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refetch to get the full recipe data
        const favResponse = await fetch('http://localhost:5000/api/users/me/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (favResponse.ok) {
          const data = await favResponse.json();
          setFavoriteRecipes(data || []);
        }
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const removeFavorite = async (recipeId) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Optimistic update - remove from local state immediately
        setFavoriteRecipes(prev => prev.filter(r => r.id !== recipeId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const toggleFavorite = async (recipeId) => {
    const isFav = favoriteRecipes.some(r => r.id === recipeId);
    if (isFav) {
      await removeFavorite(recipeId);
    } else {
      await addFavorite(recipeId);
    }
  };

  const isFavorite = (recipeId) => {
    return favoriteRecipes.some(r => r.id === recipeId);
  };

  const favoriteCount = favoriteRecipes.length;

  return {
    favorites: favoriteRecipes,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    favoriteCount,
    loading,
  };
};
