import { useState, useMemo } from 'react';

export const useRecipeFilters = (recipes = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [maxTime, setMaxTime] = useState('');

  const categories = ['all', 'breakfast', 'snack', 'lunch', 'dinner', 'sweet', 'beverage'];
  const types = ['all', 'veg', 'non-veg'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Search filter
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && recipe.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && recipe.type !== selectedType) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && recipe.difficulty !== selectedDifficulty) {
        return false;
      }

      // Time filter
      if (maxTime) {
        const recipeTime = parseTime(recipe.time_required);
        const maxTimeValue = parseTime(maxTime);
        if (recipeTime > maxTimeValue) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, searchQuery, selectedCategory, selectedType, selectedDifficulty, maxTime]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setMaxTime('');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedDifficulty !== 'all' ||
    maxTime;

  return {
    // State
    searchQuery,
    selectedCategory,
    selectedType,
    selectedDifficulty,
    maxTime,
    filteredRecipes,
    hasActiveFilters,

    // Options
    categories,
    types,
    difficulties,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSelectedType,
    setSelectedDifficulty,
    setMaxTime,
    resetFilters,
  };
};

// Helper function to parse time strings like "30 min", "1 hour", etc.
function parseTime(timeString) {
  if (!timeString) return Infinity;

  const lower = timeString.toLowerCase();
  const minutesMatch = lower.match(/(\d+)\s*min/);
  const hoursMatch = lower.match(/(\d+)\s*hour/);

  let totalMinutes = 0;

  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10);
  }

  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60;
  }

  return totalMinutes || Infinity;
}
