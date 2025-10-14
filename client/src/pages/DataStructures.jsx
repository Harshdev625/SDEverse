import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDataStructureCategories,
  fetchAllDataStructuresForList,
  searchAllDataStructures,
} from "../features/dataStructure/dataStructureSlice";
import { Link } from "react-router-dom";
import { ChevronDown, Search, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DataStructures = () => {
  const dispatch = useDispatch();
  const {
    categories = [],
    dataStructures = [],
    allDataStructuresLoading: loading,
    error,
    total,
  } = useSelector((state) => state.dataStructure);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allowMultipleDropdowns, setAllowMultipleDropdowns] = useState(true);

  useEffect(() => {
    dispatch(fetchDataStructureCategories());
    dispatch(fetchAllDataStructuresForList());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      dispatch(searchAllDataStructures({ q: query }));
    } else {
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

  const isSearching = searchQuery.trim().length > 0;

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
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
            aria-label="Go forward"
          >
            <ArrowRight size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="mb-10 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Data Structure Explorer
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Discover and learn about various data structures. Data structures are
          specialized formats for organizing and storing data efficiently, forming
          the foundation of efficient algorithms and software systems.
        </p>
      </div>

      {/* Dropdown Toggle Control */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow Multiple Dropdowns
              </span>
              <div className="relative group">
                <Info size={16} className="text-gray-500 dark:text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  When enabled, multiple categories can be expanded simultaneously. When disabled, only one category can be expanded at a time.
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setAllowMultipleDropdowns(!allowMultipleDropdowns)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                allowMultipleDropdowns ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  allowMultipleDropdowns ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

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
            className="w-full py-3 pl-10 pr-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : isSearching ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Search Results {dataStructures.length > 0 && `(${dataStructures.length})`}
          </h2>

          {dataStructures.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No data structures found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataStructures.map((dataStructure) => (
                <motion.div
                  key={dataStructure.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to={`/data-structures/${dataStructure.slug}`}
                    className="block h-full p-6 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {dataStructure.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {dataStructure.category?.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {dataStructure.definition}
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
              {categories.map((category) => {
                const categoryDataStructures = dataStructures.filter((ds) =>
                  ds.category?.includes(category)
                );

                return (
                  <div
                    key={category}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {categoryDataStructures.length}
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
                            {categoryDataStructures.length > 0 ? (
                              categoryDataStructures.map((dataStructure) => (
                                <motion.div
                                  key={dataStructure.slug}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Link
                                    to={`/data-structures/${dataStructure.slug}`}
                                    className="block p-4 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
                                  >
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                      {dataStructure.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {dataStructure.definition}
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
    </motion.div>
  );
};

export default DataStructures;