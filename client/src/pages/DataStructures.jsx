import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDataStructureCategories,
  fetchAllDataStructuresForList,
  searchAllDataStructures,
  setIsSearchingActive,
} from "../features/dataStructure/dataStructureSlice";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Preserve Scroll Position (same as Algorithm.jsx)
const usePreserveScroll = () => {
  const [savedScroll, setSavedScroll] = useState(0);

  useEffect(() => {
    const handleBeforeUpdate = () => setSavedScroll(window.scrollY);
    window.addEventListener("beforeunload", handleBeforeUpdate);
    return () => window.removeEventListener("beforeunload", handleBeforeUpdate);
  }, []);

  useEffect(() => {
    if (savedScroll) {
      requestAnimationFrame(() => window.scrollTo(0, savedScroll));
    }
  });

  // ✅ Matching Algorithm.jsx scroll restoration
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);
};

// ✅ Scrollable Dropdown
const ScrollableDropdown = ({
  label,
  options = [],
  selectedValue,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-48" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                   rounded-md px-3 py-2 shadow-sm w-full 
                   flex justify-between items-center focus:ring-2 focus:ring-blue-500 
                   focus:outline-none transition appearance-none"
      >
        <span className="truncate">{selectedValue || label}</span>
        <svg
          className={`w-4 h-4 ml-2 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-md 
                     border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 shadow-lg scrollbar-dark"
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 ${
                option === selectedValue ? "bg-blue-50 dark:bg-gray-700" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Filter Component (same UI as AlgorithmFilters)
const DataStructureFilters = ({
  onFilterApplied,
  onCategoryChange,
  onDifficultyChange,
}) => {
  const dispatch = useDispatch();
  const { categories = [], isSearchingActive } = useSelector(
    (state) => state.dataStructure
  );

  const [selectedDifficulty, setSelectedDifficulty] =
    useState("All Difficulty");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  useEffect(() => {
    dispatch(fetchDataStructureCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (selectedDifficulty && selectedDifficulty !== "All Difficulty") {
      params.difficulty = selectedDifficulty.toLowerCase();
    }
    if (selectedCategory && selectedCategory !== "All Categories") {
      params.category = selectedCategory;
    }

    dispatch(fetchAllDataStructuresForList(params));

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

    if (!isSearchingActive) {
      dispatch(fetchAllDataStructuresForList());
    }

    if (onFilterApplied) onFilterApplied(false);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
      <select
        value={selectedDifficulty}
        onChange={(e) => setSelectedDifficulty(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                   text-gray-900 dark:text-white rounded-md px-3 py-2 shadow-sm 
                   focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
      >
        <option>All Difficulty</option>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <ScrollableDropdown
        label="All Categories"
        options={["All Categories", ...categories]}
        selectedValue={selectedCategory}
        onSelect={(value) => setSelectedCategory(value)}
      />

      <button
        onClick={handleClearFilters}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 
                   dark:text-white rounded-md hover:bg-gray-300 
                   dark:hover:bg-gray-600 transition-all shadow-sm"
      >
        Clear Filters
      </button>
    </div>
  );
};

// ✅ Main Component — matches Algorithm UI structure
const DataStructures = () => {
  const dispatch = useDispatch();
  const {
    categories = [],
    dataStructures = [],
    allDataStructuresLoading: loading,
    error,
  } = useSelector((state) => state.dataStructure);

  const navigate = useNavigate();
  usePreserveScroll();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allowMultipleDropdowns, setAllowMultipleDropdowns] = useState(true);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    dispatch(fetchDataStructureCategories());
    dispatch(fetchAllDataStructuresForList());
  }, [dispatch]);

  useEffect(() => {
    setExpandedCategories({});
    setSelectedCategory(null);
  }, [allowMultipleDropdowns, selectedDifficulty, isFilterActive]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      dispatch(setIsSearchingActive(true));
      dispatch(searchAllDataStructures({ q: query }));
    } else {
      dispatch(setIsSearchingActive(false));
      dispatch(fetchAllDataStructuresForList());
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);

    if (allowMultipleDropdowns) {
      // Allow multiple dropdowns to be open
      setExpandedCategories((prev) => ({
        ...prev,
        [category]: !prev[category],
      }));
    } else {
      // Only allow one dropdown to be open at a time
      const isCurrentlyOpen = expandedCategories[category];
      if (isCurrentlyOpen) {
        // Close the current category
        setExpandedCategories((prev) => ({
          ...prev,
          [category]: false,
        }));
      } else {
        // Close all other categories and open the selected one
        setExpandedCategories({ [category]: true });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex justify-between items-center w-full">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                       hover:bg-gray-200 dark:hover:bg-gray-700 
                       transition-all shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                       hover:bg-gray-200 dark:hover:bg-gray-700 
                       transition-all shadow-sm"
            aria-label="Go forward"
          >
            <ArrowRight
              size={20}
              className="text-gray-700 dark:text-gray-300"
            />
          </button>
        </div>
      </div>

      {/* Toggle + Info */}
      <div className="mb-4 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setAllowMultipleDropdowns(!allowMultipleDropdowns)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          allowMultipleDropdowns
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
            aria-label="Toggle multiple dropdowns"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                allowMultipleDropdowns ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <div className="relative group">
            <Info
              size={16}
              className="text-gray-500 dark:text-gray-400 cursor-help"
            />
            <div
              className="absolute right-0 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 
                            text-white dark:text-gray-900 text-xs rounded-lg 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                            pointer-events-none whitespace-nowrap z-10 shadow-lg 
                            border border-gray-700 dark:border-gray-200"
            >
              Toggle whether multiple categories can be expanded simultaneously.
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-10 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Data Structure Explorer
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Discover and learn about various data structures. Data structures are
          specialized formats for organizing and storing data efficiently,
          forming the foundation of efficient algorithms and software systems.
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-8 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <DataStructureFilters
          onFilterApplied={setIsFilterActive}
          onCategoryChange={setSelectedCategory}
          onDifficultyChange={setSelectedDifficulty}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-10">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search data structures by name, category, or definition..."
            className="w-full py-3 pl-10 pr-4 rounded-xl bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-white border border-gray-300 
                       dark:border-gray-600 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error?.message || String(error)}
        </div>
      ) : (
        <>
          {isSearching ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Search Results{" "}
                {dataStructures.length > 0 && `(${dataStructures.length})`}
              </h2>

              {dataStructures.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No data structures found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataStructures.map((ds) => (
                    <motion.div
                      key={ds.slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        to={`/data-structures/${ds.slug}`}
                        className="block h-full p-6 rounded-xl bg-white dark:bg-gray-800 
                                   hover:bg-gray-50 dark:hover:bg-gray-700 
                                   border border-gray-200 dark:border-gray-700 
                                   transition-all shadow-sm hover:shadow-md"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {ds.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {/* 🟩 Difficulty badge */}
                          {ds.difficulty && (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                ds.difficulty.toLowerCase() === "easy"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : ds.difficulty.toLowerCase() === "medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                              }`}
                            >
                              {ds.difficulty}
                            </span>
                          )}

                          {/* 🔵 Tags badges */}
                          {ds.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs font-medium rounded-full 
                 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {ds.definition || "No description available"}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Browse by Category
              </h2>

              {categories.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">
                    No categories available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...categories]
                    .sort((a, b) => (isFilterActive ? a.localeCompare(b) : 0))
                    .map((category) => {
                      const filtered = dataStructures.filter((ds) => {
                        const matchesCategory = ds.category?.includes(category);
                        const matchesDifficulty =
                          !selectedDifficulty ||
                          selectedDifficulty === "All Difficulty" ||
                          (ds.difficulty &&
                            ds.difficulty.toLowerCase() ===
                              selectedDifficulty.toLowerCase());

                        return matchesCategory && matchesDifficulty;
                      });

                      if (isFilterActive && filtered.length === 0) return null;

                      return (
                        <div
                          key={category}
                          className={`border rounded-xl overflow-hidden shadow-sm transition-all ${
                            expandedCategories[category]
                              ? "border-blue-400 dark:border-blue-600"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full flex justify-between items-center p-4 
                                       bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 
                                       dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {category}
                              </h3>
                              <span
                                className="px-2 py-1 text-xs font-medium rounded-full 
                                           bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              >
                                {filtered.length}
                              </span>
                            </div>
                            <ChevronDown
                              size={20}
                              className={`transition-transform ${
                                expandedCategories[category] ? "rotate-180" : ""
                              } text-gray-500 dark:text-gray-400`}
                            />
                          </button>

                          <AnimatePresence>
                            {expandedCategories[category] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {filtered.length > 0 ? (
                                    filtered.map((ds) => (
                                      <motion.div
                                        key={ds.slug}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Link
                                          to={`/data-structures/${ds.slug}`}
                                          className="block p-4 rounded-lg bg-white dark:bg-gray-800 
                                                     hover:bg-gray-50 dark:hover:bg-gray-700 
                                                     border border-gray-200 dark:border-gray-700 transition-all"
                                        >
                                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            {ds.title}
                                          </h4>

                                          <div className="flex flex-wrap gap-2 mb-2">
                                            {/* 🟩 Difficulty badge */}
                                            {ds.difficulty && (
                                              <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                  ds.difficulty.toLowerCase() ===
                                                  "easy"
                                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                    : ds.difficulty.toLowerCase() ===
                                                      "medium"
                                                    ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                                }`}
                                              >
                                                {ds.difficulty}
                                              </span>
                                            )}

                                            {/* 🔵 Tags badges */}
                                            {ds.tags?.map((tag) => (
                                              <span
                                                key={tag}
                                                className="px-2 py-1 text-xs font-medium rounded-full 
                 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                          </div>

                                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {ds.definition}
                                          </p>
                                        </Link>
                                      </motion.div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 dark:text-gray-400 col-span-full py-2">
                                      No data structures in this category.
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default DataStructures;
