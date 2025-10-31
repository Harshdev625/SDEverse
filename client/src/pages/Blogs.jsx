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
  Search,
  X,
  Sparkles,
} from "lucide-react";
import Button from "../components/ui/Button";
import Pagination from "./Pagination";

const Blogs = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { blogs, categories, popularTags, loading, error, pagination } = useSelector(
    (state) => state.blog
  );

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredQuery = useDeferredValue(searchQuery);
  const isDark = mode === "dark";
  const isLoggedIn = !!user;

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
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatReadTime = (text) => {
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / 225);
    return `${minutes} min read`;
  };

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
        <header className="text-center mb-10">
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
              Learn. Write. Grow.
            </h1>

            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              Dive into tutorials, interview experiences, and developer insights.
              <span className="block mt-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                Your knowledge fuels the community.
              </span>
            </p>
          </motion.div>
        </header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-5 mb-10"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Any Tag</option>
                {popularTags.slice(0, 10).map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button
                type="submit"
                className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Search
              </Button>
              {(searchQuery || selectedCategory || selectedTag) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </motion.div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Latest Articles
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {loading
                ? "Loading..."
                : `${pagination.totalBlogs || blogs.length} article${
                    (pagination.totalBlogs || blogs.length) !== 1 ? "s" : ""
                  }`}
            </p>
          </div>

          {isLoggedIn && (
            <div className="flex gap-3">
              <Link to="/my-posts">
                <button className="px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                  My Posts
                </button>
              </Link>

              <Link to="/blogs/new">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                  <span className="text-xl">+</span>
                  Write Article
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
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

        <Pagination
          currentPage={pagination.currentPage || currentPage}
          totalPages={pagination.totalPages || 1}
          onPageChange={setCurrentPage}
        />
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 space-y-4 animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
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
    transition={{ duration: 0.4, delay: index * 0.06 }}
    className="h-full group"
  >
    <Link
      to={`/blogs/${blog.slug}`}
      className="block h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/30 dark:border-gray-700/50 p-6 space-y-5"
    >
      <div className="flex items-center gap-2">
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

      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {blog.title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
        {blog.excerpt}
      </p>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
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
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
          <Calendar size={14} className="text-amber-600" />
          <span className="font-semibold">{formatReadTime(blog.content)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/20">
            {blog.author?.avatarUrl ? (
              <img
                src={blog.author.avatarUrl}
                alt={blog.author.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {blog.author?.fullName || blog.author?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(blog.publishedAt || blog.createdAt)}
            </p>
          </div>
        </div>
        <Sparkles
          size={18}
          className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </Link>
  </motion.div>
);

export default Blogs;