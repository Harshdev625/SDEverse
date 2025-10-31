/* src/pages/AdminBlogReview.jsx */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X as XIcon
} from "lucide-react";
import clsx from "clsx";

import { getDraftBlogs, publishBlog, rejectBlog, clearBlogError } from "../features/blog/blogSlice";
import Loader from "../components/Loader";
import BlogDetail from "./BlogDetail";

const AdminBlogReview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { drafts, loading, error, pagination } = useSelector((state) => state.blog);
  const isDark = useSelector((state) => state.theme.mode === "dark");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(
      getDraftBlogs({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      })
    );
  }, [dispatch, currentPage, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const handlePublish = async () => {
    if (!selectedBlog) return;
    await dispatch(publishBlog(selectedBlog.slug));
    setShowModal(false);
    setSelectedBlog(null);
    dispatch(getDraftBlogs({ page: currentPage, limit: 10, search: searchQuery }));
  };

  const handleReject = async () => {
    if (!selectedBlog) return;
    await dispatch(rejectBlog(selectedBlog.slug));
    setShowModal(false);
    setSelectedBlog(null);
    dispatch(getDraftBlogs({ page: currentPage, limit: 10, search: searchQuery }));
  };

  const statusConfig = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200", icon: Clock },
    draft: { label: "Draft", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200", icon: FileText },
    published: { label: "Published", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200", icon: CheckCircle },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200", icon: XCircle },
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 to-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="sticky top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={20} />
        <span className="font-medium hidden sm:inline">Back</span>
      </button>

      {/* Main Container */}
      <article className="max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-gray-700/60 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 lg:p-12 2xl:p-16 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
                  Blog Review Queue
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  {drafts.length} draft{drafts.length !== 1 ? "s" : ""} awaiting review
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search drafts..."
                    className="pl-12 pr-5 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white w-full sm:w-80"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 sm:mx-8 lg:mx-12 2xl:mx-16 mb-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => dispatch(clearBlogError())}
                className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <XIcon size={16} />
                Dismiss
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-12 2xl:p-16">
            {drafts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No drafts to review
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  All blogs are up to date. Check back later for new submissions.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-white/50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Blog
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Author
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                          // Skeleton Rows
                          Array(5).fill().map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                  <div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-2"></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                              <td className="px-6 py-5"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div></td>
                              <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                              <td className="px-6 py-5 text-right">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          drafts.map((blog) => {
                            const status = blog.reviewStatus || blog.status || "draft";
                            const config = statusConfig[status];
                            const Icon = config.icon;
                            return (
                              <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <img
                                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                                      src={blog.author.avatarUrl || `https://ui-avatars.com/api/?name=${blog.author.username}&background=random`}
                                      alt=""
                                    />
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                                        {blog.title}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                        {blog.excerpt?.substring(0, 80) || "No excerpt"}...
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {blog.author.fullName || blog.author.username}
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <span className={clsx(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                                    config.color
                                  )}>
                                    <Icon size={14} />
                                    {config.label}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(blog.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <button
                                    onClick={() => handleViewBlog(blog)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                                  >
                                    <Eye size={16} />
                                    Review
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="bg-white/50 dark:bg-gray-800/50 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(currentPage * 10, pagination.totalDrafts)}</span> of{" "}
                        <span className="font-medium">{pagination.totalDrafts}</span> drafts
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className={clsx(
                            "px-4 py-2 rounded-xl font-medium transition-all",
                            currentPage === 1
                              ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
                          )}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.totalPages))}
                          disabled={currentPage === pagination.totalPages}
                          className={clsx(
                            "px-4 py-2 rounded-xl font-medium transition-all",
                            currentPage === pagination.totalPages
                              ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
                          )}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </article>

      {/* Full Blog Preview Modal */}
      {showModal && selectedBlog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <XIcon size={20} />
              </button>

              {/* Blog Preview */}
              <div className="p-8 lg:p-12 2xl:p-16 max-h-[80vh] overflow-y-auto">
                <BlogDetail overrideBlog={selectedBlog} isPreviewMode={true} />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <XCircle size={20} />
                  Reject
                </button>
                <button
                  onClick={handlePublish}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle size={20} />
                  Approve & Publish
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminBlogReview;