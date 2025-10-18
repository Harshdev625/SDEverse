import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlgorithmsForList,
  fetchCategories,
} from "../../features/algorithm/algorithmSlice";
import ScrollableDropdown from "./ScrollableDropdown";

const AlgorithmFilters = ({
  onFilterApplied,
  onCategoryChange,
  onDifficultyChange,
}) => {
  const dispatch = useDispatch();

  // ✅ Access categories from Redux store
  const { categories = [] } = useSelector((state) => state.algorithm);

  const [selectedDifficulty, setSelectedDifficulty] =
    useState("All Difficulty");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // ✅ Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (selectedDifficulty && selectedDifficulty !== "All Difficulty") {
      params.difficulty = selectedDifficulty.toLowerCase();
    }
    if (selectedCategory && selectedCategory !== "All Categories") {
      params.category = selectedCategory;
    }

    console.log("Sending filters:", params);
    dispatch(fetchAlgorithmsForList(params));

    const hasFilters =
      (selectedDifficulty && selectedDifficulty !== "All Difficulty") ||
      (selectedCategory && selectedCategory !== "All Categories");

    if (onFilterApplied) onFilterApplied(hasFilters);
    if (onCategoryChange) onCategoryChange(selectedCategory);
    if (onDifficultyChange) onDifficultyChange(selectedDifficulty);
  }, [selectedDifficulty, selectedCategory, dispatch]);

  const handleClearFilters = () => {
    setSelectedDifficulty("All Difficulty");
    setSelectedCategory("All Categories");
    if (!window.isSearchingActive) {
      dispatch(fetchAlgorithmsForList(params));
    }

    if (onFilterApplied) onFilterApplied(false);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
      {/* Difficulty Dropdown */}
      <select
        value={selectedDifficulty}
        onChange={(e) => setSelectedDifficulty(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
      >
        <option>All Difficulty</option>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      {/* ✅ Scrollable Custom Dropdown for Categories */}
      <ScrollableDropdown
        label="All Categories"
        options={["All Categories", ...categories]}
        selectedValue={selectedCategory}
        onSelect={(value) => setSelectedCategory(value)}
      />

      <button
        onClick={handleClearFilters}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-sm"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default AlgorithmFilters;
