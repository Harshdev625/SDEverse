/* src/pages/MyBlogs.jsx */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBlogs } from "../../features/blog/blogSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Search, X } from "lucide-react";
import Loader from "../../components/Loader";
import Pagination from "../shared/Pagination";

export default function MyBlogs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((s) => s.theme);
  const { user } = useSelector((s) => s.auth);
  const { myBlogs = [], loading, error } = useSelector((s) => s.blog);
  const isDark = mode === "dark";
  const isLoggedIn = !!user;

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchMyBlogs());
  }, [dispatch, isLoggedIn]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myBlogs.filter((b) => {
      if (filterStatus !== "all") {
        if (filterStatus === "draft" && b.status !== "draft") return false;
        if (filterStatus === "pending" && b.reviewStatus !== "pending") return false;
        if (filterStatus === "published") {
          if (b.status !== "published" || b.reviewStatus !== "approved") return false;
        }
      }
      if (!q) return true;
      return (
        (b.title || "").toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        (b.tags || []).some(t => t.toLowerCase().includes(q))
      );
    });
  }, [myBlogs, query, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const clearSearch = () => {
    setQuery("");
    setCurrentPage(1);
  };

  const handleEditClick = (e, slug) => {
    e.stopPropagation();
    navigate(`/edit/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

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

        <header className="text-center mb-10 pb-20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full border border-white/30 dark:border-gray-700/50 shadow-lg">
              <BookOpen className="text-indigo-600 dark:text-indigo-400" size={22} />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                My Posts
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-normal">
              Manage your content
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              Drafts, pending reviews, and published articles – all in one place.
            </p>
          </motion.div>
        </header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-5 mb-10"
        >
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search your posts..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              {query && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="md:col-span-4 flex gap-3 justify-end">
              <Link to="/blogs/new">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                  <span className="text-xl">+</span>
                  Create Post
                </button>
              </Link>
              <Link to="/blogs">
                <button className="px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                  Explore Blogs
                </button>
              </Link>
            </div>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {error && (
            <div className="col-span-full text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          )}

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-xl border border-white/30 dark:border-gray-700/50"
            >
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 mb-4">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No posts yet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Start by creating a new draft or publishing a pending post.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link to="/blogs/new">
                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                      Create first post
                    </button>
                  </Link>
                  <Link to="/blogs">
                    <button className="px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                      Browse community
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {paginated.map((b, idx) => (
                <motion.article
                  key={b._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="h-full group"
                >
                  <Link
                    to={`/blogs/${b.slug}`}
                    className="block h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/30 dark:border-gray-700/50 p-6 space-y-5"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-md">
                        {b.category}
                      </span>
                      {b.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {b.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {b.excerpt}
                    </p>

                    <div className="flex justify-end">
                      {b.status === "draft" && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Draft
                        </span>
                      )}
                      {b.reviewStatus === "pending" && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          Pending Review
                        </span>
                      )}
                      {b.reviewStatus === "approved" && b.status === "published" && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Published
                        </span>
                      )}
                      {b.reviewStatus === "rejected" && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-3 text-sm">
                        {/* EDIT: Use button + navigate */}
                        <button
                          onClick={(e) => handleEditClick(e, b.slug)}
                          className="text-indigo-600 hover:underline focus:outline-none"
                        >
                          Edit
                        </button>

                        {/* VIEW: Keep as Link */}
                        <Link
                          to={`/blogs/${b.slug}/edit`}
                          className="text-gray-600 dark:text-gray-300 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(b.createdAt)}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}