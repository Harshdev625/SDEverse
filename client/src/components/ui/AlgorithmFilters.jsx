import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAlgorithmsForList } from "../../features/algorithm/algorithmSlice";

const AlgorithmFilters = ({ onFilterApplied }) => {
  const dispatch = useDispatch();
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulty");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // ✅ Runs whenever dropdown values change
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

    // ✅ Only mark filter mode active if actual filters are applied
    const hasFilters =
      (selectedDifficulty && selectedDifficulty !== "All Difficulty") ||
      (selectedCategory && selectedCategory !== "All Categories");

    if (onFilterApplied) onFilterApplied(hasFilters);
  }, [selectedDifficulty, selectedCategory, dispatch, onFilterApplied]);

  // ✅ Clear filters handler
  const handleClearFilters = () => {
    setSelectedDifficulty("All Difficulty");
    setSelectedCategory("All Categories");
    dispatch(fetchAlgorithmsForList({})); // load all
    if (onFilterApplied) onFilterApplied(false); // switch back to “Browse by Category”
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

      {/* Category Dropdown */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
      >
        <option>All Categories</option>
        <option>Sorting</option>
        <option>Searching</option>
        <option>Graphs</option>
        <option>Trees</option>
        <option>Dynamic Programming</option>
      </select>

      {/* Clear Filters Button */}
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
