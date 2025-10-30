/* src/pages/Blogs.jsx */
import { useState, useEffect, useCallback, useDeferredValue } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchBlogs,
  fetchBlogCategories,
  fetchPopularTags,
} from "../features/blog/blogSlice";
import {
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  User,
  BookOpen,
  ChevronRight,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import Button from "../components/ui/Button";

/* -------------------------------------------------------------------------- */
/*                         YOUR ORIGINAL PAGINATION UI                        */
/* -------------------------------------------------------------------------- */
function Pagination({ currentPage, totalPages, onPrev, onNext, hasPrev, hasNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-12">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className="px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>

      <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className="px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 MAIN PAGE                                  */
/* -------------------------------------------------------------------------- */
const Blogs = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { blogs, categories, popularTags, loading, error, pagination } = useSelector((state) => state.blog);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredQuery = useDeferredValue(searchQuery);
  const isDark = mode === "dark";

  /* --------------------------- FETCH DATA --------------------------- */
  useEffect(() => {
    dispatch(fetchBlogCategories());
    dispatch(fetchPopularTags());
  }, [dispatch]);

  const fetchBlogsWithParams = useCallback(() => {
    const params = { page: currentPage, limit: 12 };
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTag) params.tag = selectedTag;
    if (deferredQuery.trim()) params.search = deferredQuery.trim();
    dispatch(fetchBlogs(params));
  }, [dispatch, currentPage, selectedCategory, selectedTag, deferredQuery]);

  useEffect(() => {
    fetchBlogsWithParams();
  }, [fetchBlogsWithParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedTag("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatReadTime = (text) => {
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / 225);
    return `${minutes} min`;
  };

  /* --------------------------- RENDER --------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen py-8 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HERO ==================== */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full border border-white/30 dark:border-gray-700/50 shadow-lg">
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={22} />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                Community Blog
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Share Your Knowledge
            </h1>

            <div className="w-28 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full shadow-md" />

            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join a vibrant community of developers sharing insights, tutorials,
              and real-world experiences.
              <span className="block mt-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                Your voice matters here.
              </span>
            </p>
          </motion.div>
        </header>

        {/* ==================== FILTERS + GRID ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ------------------- SIDEBAR (Filters) ------------------- */}
          <aside className="lg:col-span-1">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-6 space-y-6 sticky top-6"
            >
              {/* Mobile Toggle */}
              <details className="lg:hidden" open>
                <summary className="flex items-center justify-between cursor-pointer text-lg font-bold text-gray-800 dark:text-white">
                  Filters
                  <ChevronRight
                    size={20}
                    className="text-indigo-600 dark:text-indigo-400 transition-transform ui-open:rotate-90"
                  />
                </summary>

                <div className="mt-5 space-y-4">
                  <SearchForm
                    query={searchQuery}
                    setQuery={setSearchQuery}
                    onSearch={handleSearch}
                    onClear={clearFilters}
                    hasActive={!!searchQuery || !!selectedCategory || !!selectedTag}
                  />
                  <CategorySelect
                    categories={categories}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                  <TagCloud
                    tags={popularTags.slice(0, 8)}
                    selected={selectedTag}
                    onSelect={setSelectedTag}
                  />
                </div>
              </details>

              {/* Desktop Filters */}
              <div className="hidden lg:block space-y-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Search</h3>
                <SearchForm
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  onSearch={handleSearch}
                  onClear={clearFilters}
                  hasActive={!!searchQuery || !!selectedCategory || !!selectedTag}
                />
                <CategorySelect
                  categories={categories}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    Popular Tags
                  </h4>
                  <TagCloud
                    tags={popularTags.slice(0, 10)}
                    selected={selectedTag}
                    onSelect={setSelectedTag}
                  />
                </div>
              </div>
            </motion.div>
          </aside>

          {/* ------------------- MAIN CONTENT ------------------- */}
          <main className="lg:col-span-3 space-y-8">
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Latest Articles
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {loading ? "Loading..." : `${blogs.length} articles found`}
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/my-posts">
                  <Button className="px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:shadow-lg transition-all">
                    My Posts
                  </Button>
                </Link>
                <Link to="/blogs/new">
                  <Button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all">
                    <span className="text-xl">+</span>
                    <span>Write Article</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : error ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    No articles match your filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {blogs.map((blog, idx) => (
                    <BlogCard
                      key={blog._id}
                      blog={blog}
                      index={idx}
                      formatDate={formatDate}
                      formatReadTime={formatReadTime}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage || currentPage}
              totalPages={pagination.totalPages || 1}
              hasPrev={pagination.hasPrev}
              hasNext={pagination.hasNext}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
            />
          </main>
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              REUSABLE UI PARTS                             */
/* -------------------------------------------------------------------------- */
const SearchForm = ({ query, setQuery, onSearch, onClear, hasActive }) => (
  <form onSubmit={onSearch} className="flex gap-2">
    <div className="relative flex-1">
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
      />
      <input
        type="text"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
      />
    </div>
    <Button type="submit" className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
      Go
    </Button>
    {hasActive && (
      <button
        type="button"
        onClick={onClear}
        className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
      >
        <X size={18} />
      </button>
    )}
  </form>
);

const CategorySelect = ({ categories, value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
  >
    <option value="">All Categories</option>
    {categories.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
);

const TagCloud = ({ tags, selected, onSelect }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <button
        key={tag}
        onClick={() => onSelect(selected === tag ? "" : tag)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-sm ${
          selected === tag
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
            : "bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        #{tag}
      </button>
    ))}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-5 space-y-4 animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    <div className="flex gap-2">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
    </div>
  </div>
);

const BlogCard = ({ blog, index, formatDate, formatReadTime }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="h-full group"
  >
    <Link
      to={`/blogs/${blog.slug}`}
      className="block h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/30 dark:border-gray-700/50 overflow-hidden"
    >
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="aspect-video overflow-hidden relative">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category + Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-md">
            {blog.category}
          </span>
          {blog.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {blog.excerpt}
        </p>

        {/* Stats */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
            <Eye size={14} className="text-blue-600" />
            <span className="font-semibold">{blog.views || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
            <Heart size={14} className="text-red-600" />
            <span className="font-semibold">{blog.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
            <MessageCircle size={14} className="text-green-600" />
            <span className="font-semibold">{blog.commentsCount || 0}</span>
          </div>
        </div>

        {/* Author + Date */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <User size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {blog.author?.fullName || blog.author?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </p>
            </div>
          </div>
          <ChevronRight
            size={20}
            className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  </motion.div>
);

export default Blogs;