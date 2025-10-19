import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Bookmark, Filter, Search, Calendar, Tag } from "lucide-react";
import { getUserBookmarks } from "../features/bookmark/bookmarkSlice";

const BookmarksPage = () => {
  const dispatch = useDispatch();
  const { bookmarks, total, currentPage, totalPages, status, error } = useSelector(
    (state) => state.bookmark
  );
  const { token } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    contentType: "",
    search: "",
    page: 1,
  });

  useEffect(() => {
    if (token) {
      dispatch(getUserBookmarks(filters));
    }
  }, [dispatch, token, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset to page 1 when changing filters
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "hard":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please login to view your bookmarks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Bookmarks
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved algorithms and data structures
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Content Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filters.contentType}
                onChange={(e) => handleFilterChange("contentType", e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="algorithm">Algorithms</option>
                <option value="dataStructure">Data Structures</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {status.fetchBookmarks === "loading" ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error.fetchBookmarks ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error.fetchBookmarks}</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bookmarks yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start bookmarking algorithms and data structures to see them here
            </p>
            <Link
              to="/algorithms"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Algorithms
            </Link>
          </div>
        ) : (
          <>
            {/* Bookmarks Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((bookmark) => {
                const content = bookmark.contentId;
                const isAlgorithm = bookmark.contentType === "algorithm";
                
                return (
                  <div
                    key={bookmark._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link
                          to={`/${isAlgorithm ? "algorithms" : "data-structures"}/${content.slug}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {content.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {isAlgorithm ? "Algorithm" : "Data Structure"}
                          </span>
                          {content.difficulty && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(content.difficulty)}`}>
                              {content.difficulty}
                            </span>
                          )}
                          {content.type && (
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              {content.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Bookmark 
                          className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-current" 
                          title="Bookmarked"
                        />
                      </div>
                    </div>

                    {/* Categories/Tags */}
                    {content.category && content.category.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {content.category.slice(0, 3).map((cat, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {cat}
                            </span>
                          ))}
                          {content.category.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{content.category.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Bookmarked {formatDate(bookmark.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handleFilterChange("page", Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handleFilterChange("page", Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {bookmarks.length} of {total} bookmarks
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;